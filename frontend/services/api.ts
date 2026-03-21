import axios from 'axios';
import Constants from 'expo-constants';

function resolveBaseUrl() {
  const explicitUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicitUrl) {
    return explicitUrl;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    '';

  const host = hostUri.split(':')[0];
  if (host) {
    return `http://${host}:5000`;
  }

  return 'http://localhost:5000';
}

const BASE_URL = resolveBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? 'Network error';
  }
  return 'An unexpected error occurred';
}

export function getBaseUrl() {
  return BASE_URL;
}

export default api;
