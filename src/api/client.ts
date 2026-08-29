import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Point this at your Django backend.
 *
 * - Android emulator: use 10.0.2.2 instead of localhost (Android maps
 *   that IP to the host machine).
 * - Physical phone via Expo Go: use your computer's LAN IP, e.g.
 *   http://192.168.1.42:8000 -- "localhost" on your phone means the
 *   phone itself, not your laptop. Find your IP with `ipconfig`
 *   (Windows) and make sure phone + laptop are on the same Wi-Fi.
 * - iOS simulator (Mac only): localhost works as-is.
 */
export const API_BASE_URL = "https://ridex360-backend.onrender.com/api";

const ACCESS_TOKEN_KEY = "ridex360_access_token";
const REFRESH_TOKEN_KEY = "ridex360_refresh_token";

async function getTokens() {
  const [access, refresh] = await Promise.all([
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
    AsyncStorage.getItem(REFRESH_TOKEN_KEY),
  ]);
  return { access, refresh };
}

export async function setTokens(access: string, refresh: string) {
  await Promise.all([
    AsyncStorage.setItem(ACCESS_TOKEN_KEY, access),
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh),
  ]);
}

export async function clearTokens() {
  await Promise.all([
    AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
  ]);
}

async function refreshAccessToken(): Promise<string | null> {
  const { refresh } = await getTokens();
  if (!refresh) return null;

  const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;

  const data = await res.json();
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.access);
  return data.access;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Core request helper. Attaches the JWT access token, retries once
 * with a refreshed token on a 401, and throws ApiError on failure so
 * screens can show a real message instead of a silent crash.
 */
export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { access } = await getTokens();
  const doFetch = async (token: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

  let res = await doFetch(access);

  if (res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      res = await doFetch(newAccess);
    }
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || JSON.stringify(data);
    } catch {
      // response wasn't JSON -- keep statusText
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new ApiError(res.status, "Invalid username or password");
  const data = await res.json();
  await setTokens(data.access, data.refresh);
}
