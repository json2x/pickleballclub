const DEFAULT_REDIRECT = '/';
const TRUSTED_ORIGIN = 'https://pickle-lo.local';

export function getSafeRedirect(value: string | null | undefined, fallback = DEFAULT_REDIRECT) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return fallback;
  }

  try {
    const parsed = new URL(value, TRUSTED_ORIGIN);

    if (parsed.origin !== TRUSTED_ORIGIN) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return fallback;
  }
}

export function buildLoginRedirect(next: string) {
  const safeNext = getSafeRedirect(next);
  return `/login?next=${encodeURIComponent(safeNext)}`;
}
