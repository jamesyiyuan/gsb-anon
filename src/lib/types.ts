export type Comment = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  profiles: { pseudonym: string } | null;
};

export type Post = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  profiles: { pseudonym: string } | null;
  comments: Comment[];
};
