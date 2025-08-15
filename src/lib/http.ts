import { joinApi, assertJsonOrNoBody } from "./apiBase";

export interface ApiResult<T = any> {
  ok: boolean;
  data?: T | null;
  error?: string;
  status: number;
}

export async function http<T = any>(
  endpoint: string,
  init: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const token = localStorage.getItem("token");
    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(joinApi(endpoint), { ...init, headers });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: body || res.statusText, status: res.status };
    }

    if (res.status === 204) return { ok: true, data: null, status: res.status };

    assertJsonOrNoBody(res, endpoint);
    if ((res.headers.get("content-type") || "").includes("application/json")) {
      const data = (await res.json()) as T;
      return { ok: true, data, status: res.status };
    }

    return { ok: true, data: null, status: res.status };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error", status: 0 };
  }
}
