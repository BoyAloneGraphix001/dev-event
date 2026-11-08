export function getBaseUrl(): string | undefined {
  const configuredUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (!configuredUrl) return undefined;

  const baseUrl = /^https?:\/\//i.test(configuredUrl)
    ? configuredUrl
    : `https://${configuredUrl}`;

  return baseUrl.replace(/\/+$/, '');
}
