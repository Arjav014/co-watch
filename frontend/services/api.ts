import axios from 'axios';

// TODO: Replace with your actual backend URL
const BASE_URL = 'http://10.12.36.145:5000'; // Android emulator → localhost

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Attach JWT token to all outgoing requests */
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

/** Standardised error extraction */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? 'Network error';
  }
  return 'An unexpected error occurred';
}

export default api;
