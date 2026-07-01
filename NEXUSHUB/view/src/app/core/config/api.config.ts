const LOCAL_BACKEND_URL = 'http://localhost:8085';

const productionHosts = new Set([
  'dsc.rodrigor.com',
  'eq01.dsc.rodrigor.com'
]);

export function getApiBaseUrl(): string {
  const { protocol, hostname, origin } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return LOCAL_BACKEND_URL;
  }

  if (productionHosts.has(hostname)) {
    return `${protocol}//${hostname}`;
  }

  return origin;
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
