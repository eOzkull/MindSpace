export const API_BASE_URL = '/api';

// ---------------------------------------------------------------------------
// Typed API error — consumers can `catch (e) { if (e instanceof ApiError) }`
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: unknown;

  constructor(status: number, statusText: string, body: unknown) {
    super(`API ${status} ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

// ---------------------------------------------------------------------------
// Shared response handler — parses JSON and throws ApiError on non-2xx
// ---------------------------------------------------------------------------
async function _handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => null);
    }
    throw new ApiError(res.status, res.statusText, body);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Shared fetch defaults — credentials: 'include' ensures Flask session
// cookies are forwarded on every request (required for session-isolated state)
// ---------------------------------------------------------------------------
const BASE_INIT: RequestInit = {
  credentials: 'include',
};

export const apiClient = {
  /** HTTP GET — always forwards session cookies */
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, { ...BASE_INIT });
    return _handle<T>(res);
  },

  /** HTTP POST — forwards session cookies; auto-detects JSON vs FormData */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const options: RequestInit = { ...BASE_INIT, method: 'POST' };

    if (body !== undefined) {
      if (body instanceof FormData) {
        options.body = body;
        // Let the browser set Content-Type with boundary automatically
      } else {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(body);
      }
    }

    const res = await fetch(`${API_BASE_URL}${path}`, options);
    return _handle<T>(res);
  },

  /** HTTP DELETE — forwards session cookies */
  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...BASE_INIT,
      method: 'DELETE',
    });
    return _handle<T>(res);
  },
};

