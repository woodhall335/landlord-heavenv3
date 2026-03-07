export function safeInternalRedirect(input: string | null | undefined): string {
  if (!input) return '/dashboard';
  const value = input.trim();
  if (!value.startsWith('/')) return '/dashboard';
  if (value.startsWith('//')) return '/dashboard';
  if (value.includes('\\')) return '/dashboard';
  if (/\s/.test(value)) return '/dashboard';
  const lower = value.toLowerCase();
  if (lower.startsWith('/javascript:') || lower.startsWith('/data:')) return '/dashboard';
  return value;
}
