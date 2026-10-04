export const ALLOWED_EMAIL_DOMAIN = "gsb.columbia.edu";

export function isAllowedEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}
