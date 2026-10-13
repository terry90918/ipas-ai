export type SiteUser = { userId: string; displayName: string; email: string; fullName: string | null };
type PrivateOwner = { email: string; userId: string };

export function siteIdentity(requestHeaders: Headers, owner?: PrivateOwner): SiteUser | null {
 const email = requestHeaders.get('oai-authenticated-user-email');
 const userId = requestHeaders.get('oai-authenticated-user-id') ||
  (email && owner?.userId && email.toLowerCase() === owner.email.toLowerCase() ? owner.userId : null);
 if (!email || !userId) return null;
 const encoded = requestHeaders.get('oai-authenticated-user-full-name');
 let fullName: string | null = null;
 if (encoded && requestHeaders.get('oai-authenticated-user-full-name-encoding') === 'percent-encoded-utf-8') {
  try { fullName = decodeURIComponent(encoded); } catch {}
 }
 return { userId, displayName: fullName ?? email, email, fullName };
}
