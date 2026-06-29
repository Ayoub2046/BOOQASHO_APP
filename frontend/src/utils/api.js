export const API_URL = import.meta.env.VITE_API_URL || '/api';

export function friendlyFetchError(error) {
  const msg = error?.message || '';
  if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('network')) {
    return 'Server-ka lama helin. Fadlan hubi in backend-ka uu shaqeynayo (npm run dev).';
  }
  return msg || 'Cilad baa ka dhacday. Fadlan isku day mar kale.';
}

export async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  if (!response.ok) {
    throw new Error(`Server error (${response.status})`);
  }
  return null;
}

export async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    return { response, data: await parseResponse(response) };
  } catch (error) {
    throw new Error(friendlyFetchError(error));
  }
}

export async function checkBackendHealth() {
  try {
    const { data } = await apiFetch('/health');
    return data?.success === true;
  } catch {
    return false;
  }
}
