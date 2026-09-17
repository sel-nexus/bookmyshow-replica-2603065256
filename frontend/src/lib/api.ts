export interface SessionResponse { token: string; user: { id: number; mobileNumber: string }; }
/** Sends a JSON request to the same-origin API and surfaces safe errors. */
async function request<T>(path: string, body: unknown): Promise<T> { const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}${path}`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body) }); const payload = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(payload.error ?? 'Request failed.'); return payload; }
/** Starts the demo OTP challenge. */
export function beginLogin(mobileNumber: string): Promise<{ message: string }> { return request('/api/auth/login', { mobileNumber }); }
/** Exchanges the demo OTP for a signed API token. */
export function verifyOtp(mobileNumber: string, otp: string): Promise<SessionResponse> { return request('/api/auth/verify', { mobileNumber, otp }); }
