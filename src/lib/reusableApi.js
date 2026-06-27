import { authClient } from './auth-client';

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const request = async (method, endpoint, body, customHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // customHeaders na thakle eita pabe
  if (!headers['Authorization']) {
    const session = await authClient.getSession();
    const token = session?.data?.session?.token;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // fetch request
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  // error handling
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;

      if (window.location.pathname !== '/signin') {
        window.location.href = `/signin?callbackURL=${encodeURIComponent(currentPath)}`;
      }
    }
    return null;
  }

  if (res.status === 403) {
    if (typeof window !== 'undefined') {
      window.location.href = '/forbidden';
    }
    return;
  }

  return data;
};

// reusable api object
export const api = {
  get: url => request('GET', url),
  post: (url, data, headers) => request('POST', url, data, headers),
  patch: (url, data, headers) => request('PATCH', url, data, headers),
  delete: (url, headers) => request('DELETE', url, null, headers),
};
