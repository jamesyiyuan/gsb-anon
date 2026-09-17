-- GSB Anon: schema, domain gate, and row-level security
create extension if not exists pgcrypto;

-- One row per authenticated user. No email/name here on purpose: this table
-- is the anonymity boundary between "who they are" (auth.users, not exposed
-- by the API) and "what they posted" (pseudonym only).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  pseudonym text not null unique,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  is_removed boolean not null default false
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  is_removed boolean not null default false
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  constraint reports_target check (post_id is not null or comment_id is not null)
);

create index posts_created_at_idx on public.posts (created_at desc);
create index comments_post_id_idx on public.comments (post_id);

-- Reject signups outside the school domain (defense in depth: the app also
-- checks this before ever calling Supabase auth), and give every allowed
-- signup a random pseudonym instead of asking them to pick one.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_pseudonym text;
begin
  if new.email is null or lower(new.email) not like '%@gsb.columbia.edu' then
    raise exception 'Only @gsb.columbia.edu email addresses are allowed';
  end if;

  new_pseudonym := 'anon_' || substr(md5(gen_random_uuid()::text), 1, 6);

  insert into public.profiles (id, pseudonym) values (new.id, new_pseudonym);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;

-- Pseudonyms carry no PII, so any signed-in student can read them (needed to
-- show "posted by anon_x7f3k" next to a post).
create policy "profiles are readable by signed-in users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "posts are readable by signed-in users"
  on public.posts for select
  to authenticated
  using (is_removed = false);

create policy "users can create their own posts"
  on public.posts for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "users can delete their own posts"
  on public.posts for delete
  to authenticated
  using (author_id = auth.uid());

create policy "comments are readable by signed-in users"
  on public.comments for select
  to authenticated
  using (is_removed = false);

create policy "users can create their own comments"
  on public.comments for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "users can delete their own comments"
  on public.comments for delete
  to authenticated
  using (author_id = auth.uid());

-- Reports are write-only from the client (no select policy => denied by
-- default). Review them from the Supabase dashboard/service-role key.
create policy "users can file reports"
  on public.reports for insert
  to authenticated
  with check (reporter_id = auth.uid());
