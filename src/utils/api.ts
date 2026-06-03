const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export interface EntitlementsResponse {
  plan: 'free' | 'pro';
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

async function apiRequest<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured.');
  }

  // Only declare a JSON content-type when we actually send a body. Fastify
  // rejects an empty body when content-type is application/json, which would
  // turn our no-body POSTs (checkout/portal) into spurious 400s.
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.body != null) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const data = (await response.json()) as unknown;

  if (!response.ok) {
    const errorMessage =
      typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error?: unknown }).error)
        : typeof data === 'object' && data !== null && 'message' in data
          ? String((data as { message?: unknown }).message)
        : 'API request failed.';
    throw new Error(errorMessage);
  }

  return data as T;
}

export function getEntitlements(accessToken: string) {
  return apiRequest<EntitlementsResponse>('/entitlements', accessToken);
}

export function createCheckoutSession(accessToken: string) {
  return apiRequest<{ url: string | null }>('/billing/create-checkout-session', accessToken, {
    method: 'POST',
  });
}

export function createPortalSession(accessToken: string) {
  return apiRequest<{ url: string }>('/billing/create-portal-session', accessToken, {
    method: 'POST',
  });
}

export function deleteAccount(accessToken: string) {
  return apiRequest<{ deleted: boolean }>('/account/delete', accessToken, {
    method: 'POST',
  });
}

