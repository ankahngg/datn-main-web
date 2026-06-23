import { API_BASE_URL, devMode } from "@/config/app.config";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  path: string;
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined | bigint>;
  body?: TBody;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface Pageable {
  page?: number; // zero-based index as in Spring Pageable
  size?: number;
  sort?: string; // e.g. "createdAt,DESC"
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code?: string;
    message?: string;
  };
  meta?: any;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page
};

export interface ApiErrorShape {
  status: number;
  message: string;
  details?: unknown;
}

export class ApiError extends Error implements ApiErrorShape {
  status: number;
  details?: unknown;

  constructor({ status, message, details }: ApiErrorShape) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}


function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path, API_BASE_URL);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined) return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

// Main API request function
export async function request<TResponse, TBody = unknown>(
  options: RequestOptions<TBody>,
): Promise<TResponse> {
  const { path, method = "GET", query, body, signal, headers } = options;

  const url = buildUrl(path, query);

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    signal,
    credentials: "include", // quan trọng
  };

  if (body !== undefined && method !== "GET") {
    init.body = JSON.stringify(body);
  }

  if (devMode) {
    // eslint-disable-next-line no-console
    console.log("[API]", method, url, body);
  }

  const expireIn = localStorage.getItem("access_token_expire_in");
  if (expireIn == null || Number(expireIn) < Date.now()) {
    console.log("[API] Access token expired or not found, Login...");
    console.log("[API] Using credentials:", process.env.NEXT_PUBLIC_USERNAME, process.env.NEXT_PUBLIC_PASSWORD);
    const loginRes = await fetch(`${API_BASE_URL}/api/v1/auth/login-normal`, {
      method: "POST",
      body: JSON.stringify({
        username: process.env.NEXT_PUBLIC_USERNAME,
        password: process.env.NEXT_PUBLIC_PASSWORD
      }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (loginRes.ok) {
      console.log("[API] Logged in successfully");
      const data = await loginRes.json();
      const maxAgeInSeconds = 10* 60; // 10 minutes
      localStorage.setItem("access_token_expire_in", String(Date.now() + maxAgeInSeconds * 1000));
    }
    else {
      console.error("[API] Login failed with status:", loginRes.status);
      throw new ApiError({
        status: loginRes.status,
        message: "Login failed",
      });
    }
  }

  var res = await fetch(url, init);



  const json: ApiResponse<TResponse> = await res.json();
  
  if (devMode) {
    // eslint-disable-next-line no-console
    console.log("[API Response]", url, json.data);
  }


  // ❗ check HTTP error
  if (!res.ok) {
    throw new ApiError({
      status: res.status,
      message: json?.error?.message || "HTTP error",
      details: json,
    });
  }

  // ❗ check business error
  if (!json.success) {
    throw new ApiError({
      status: res.status,
      message: json?.error?.message || "Business error",
      details: json.error,
    });
  }

   return json.data;
}
