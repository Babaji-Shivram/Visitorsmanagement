export const getApiBaseUrl = (): string => {
  const w = typeof window !== "undefined" ? (window as any) : {};
  const fromWindow = typeof w.__API_BASE__ === "string" && w.__API_BASE__.trim() ? w.__API_BASE__.trim() : "";
  const fromVite = typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL;
  const fromGlobal = typeof globalThis !== "undefined" && (globalThis as any).process?.env;
  const fromProcess = fromGlobal ? (fromGlobal.REACT_APP_API_BASE_URL || fromGlobal.NEXT_PUBLIC_API_BASE_URL) : "";
  const base = (fromWindow || fromVite || fromProcess || "/api").replace(/\/+$/, "");
  return base || "/api";
};

export const API_BASE_URL = getApiBaseUrl();

export const joinApi = (path: string): string => {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${clean}`;
};

export const assertJsonOrNoBody = (res: Response, endpoint: string) => {
  const ct = res.headers.get("content-type") || "";
  if (res.status !== 204 && !ct.includes("application/json")) {
    if ((res.headers.get("content-length") || "") !== "0") {
      throw new Error(
        `Got non-JSON from ${endpoint}. Check API_BASE_URL=${API_BASE_URL}. ` +
        `Content-Type: ${ct || "n/a"}, Status: ${res.status}`
      );
    }
  }
};

if (typeof window !== "undefined") {
  console.log("[BOOT] API_BASE_URL =", API_BASE_URL);
}
