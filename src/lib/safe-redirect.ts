// Only same-site paths: "//evil.com" and "/\evil.com" would leave the site (open redirect).
export function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return undefined
  return value
}
