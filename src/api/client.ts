export const BASE_URL =
  window.__RUNTIME_CONFIG__?.API_URL ||
  (import.meta.env.VITE_FLOWABLE_API_URL as string) ||
  'http://localhost:8080';

function getAuthCreds() {
  const user = sessionStorage.getItem('authUser') || import.meta.env.VITE_FLOWABLE_USERNAME;
  const pass = sessionStorage.getItem('authPass') || import.meta.env.VITE_FLOWABLE_PASSWORD;
  return { user, pass };
}

function authHeader() {
  const { user, pass } = getAuthCreds();
  if (user && pass) {
    const b64 = btoa(`${user}:${pass}`);
    return { Authorization: `Basic ${b64}` };
  }
  return {};
}

export async function api(path: string, init: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(!('body' in init) || (init as any).body instanceof FormData ? {} : {'Content-Type': 'application/json'}),
      ...authHeader(),
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${txt}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}