import { authClient } from "./auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const request = async (method, endpoint, body) => {
  const headers = { 'Content-Type': 'application/json' };

  // request get na hole token add koro
  if (method !== 'GET') {
    const session = await authClient.getSession();
    const token = session?.data?.session?.token; // Better Auth থেকে টোকেন নেওয়া
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
  if (!res.ok) throw new Error(data.message || 'API Error');

  return data;
};

// reusable api object
export const api = {
  get: url => request('GET', url),
  post: (url, data) => request('POST', url, data),
  patch: (url, data) => request('PATCH', url, data),
  delete: url => request('DELETE', url),
};
