export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> ?? {}),
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("wtws_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: "include",
    headers,
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

  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("wtws_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`/api${path}`, {
    method: "POST",
    credentials: "include",
    headers,
    body: data,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (body as { message?: string | string[] }).message;
    throw new Error(Array.isArray(message) ? message.join(", ") : message || `Request failed (${res.status})`);
  }
  return body as T;
}
