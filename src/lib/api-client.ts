/**
 * Supreme Court Chamber Solutions - Unified Backend API Client
 * Supports seamless communication with the Express/Node.js backend hosted on Render or locally.
 */

const getBackendBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    // In browser: check NEXT_PUBLIC_API_URL, fallback to /api
    return process.env.NEXT_PUBLIC_API_URL || "/api";
  }
  // Server-side execution in Next.js
  return process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
    : "http://localhost:5000/api";
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: unknown;
}

export async function fetchFromBackend<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getBackendBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Include credentials for JWT cookies
  const config: RequestInit = {
    ...options,
    headers,
    credentials: options.credentials || "include",
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Request failed with HTTP status ${res.status}`,
        errors: data.errors,
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    console.error(`[API Client Error] Request to ${url} failed:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error connecting to backend server",
    };
  }
}

export const backendApi = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetchFromBackend<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchFromBackend<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchFromBackend<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchFromBackend<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetchFromBackend<T>(endpoint, { ...options, method: "DELETE" }),
};
