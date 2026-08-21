const API = typeof window === "undefined" ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000") : "";

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}/api${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (body as { message?: string | string[] }).message;
    throw new Error(Array.isArray(message) ? message.join(", ") : message || `Request failed (${res.status})`);
  }
  return body as T;
}

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const data = new FormData();
  data.append("file", file);
  const res = await fetch(`${API}/api${path}`, {
    method: "POST",
    credentials: "include",
    body: data,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (body as { message?: string | string[] }).message;
    throw new Error(Array.isArray(message) ? message.join(", ") : message || `Request failed (${res.status})`);
  }
  return body as T;
}
