import type { ApiResponse } from "@/types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000/api";

interface ApiOptions extends RequestInit {
  retryAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function readableErrorMessage(payload: any, fallback: string): string {
  if (typeof payload?.message === "string" && payload.message.trim()) return payload.message;

  const firstIssue = payload?.details?.issues?.[0];
  if (firstIssue?.message) {
    return firstIssue.field ? `${firstIssue.field}: ${firstIssue.message}` : firstIssue.message;
  }

  return fallback;
}

async function parseResponse(response: Response) {
  return response.json().catch(() => ({
    success: false,
    message: "The server returned an unreadable response"
  }));
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { retryAuth = true, ...requestOptions } = options;
  const isForm = requestOptions.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      credentials: "include",
      headers: {
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...requestOptions.headers
      }
    });
  } catch {
    throw new ApiError(
      `Cannot reach the GrantPilot server at ${API_URL}. Make sure the backend is running.`,
      0
    );
  }

  const isAuthAction =
    path.includes("/auth/refresh") ||
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/firebase");

  if (response.status === 401 && retryAuth && !isAuthAction) {
    try {
      const refreshed = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include"
      });
      if (refreshed.ok) {
        return apiFetch<T>(path, { ...options, retryAuth: false });
      }
    } catch {
      // The original 401 is returned below; normal signed-out state is handled by AuthProvider.
    }
  }

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(
      readableErrorMessage(payload, `Request failed with status ${response.status}`),
      response.status,
      payload?.details
    );
  }

  return payload as ApiResponse<T>;
}

export function toQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const value = search.toString();
  return value ? `?${value}` : "";
}
