import axios from "axios";
let session = () => ({}),
  expire = () => {};
let requests = new AbortController();
export function configureSession(getSession, onExpire) {
  session = getSession;
  expire = onExpire;
}
export function cancelSessionRequests() {
  requests.abort();
  requests = new AbortController();
}
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
});
client.interceptors.request.use((config) => {
  if (!import.meta.env.VITE_API_BASE_URL)
    throw new Error("Chưa cấu hình VITE_API_BASE_URL.");
  const s = session();
  config.sessionVersion = s.sessionVersion;
  const auth = config.url?.startsWith("/auth/");
  if (s.accessToken && !auth)
    config.headers.Authorization = "Bearer " + s.accessToken;
  config.signal = config.signal
    ? AbortSignal.any([config.signal, requests.signal])
    : requests.signal;
  return config;
});
client.interceptors.response.use(
  (response) => {
    if (response.config.sessionVersion !== session().sessionVersion)
      throw new axios.CanceledError("Session changed");
    return response;
  },
  (error) => {
    if (
      error.config?.sessionVersion !== undefined &&
      error.config.sessionVersion !== session().sessionVersion
    )
      return Promise.reject(new axios.CanceledError("Session changed"));
    if (
      error.response?.status === 401 &&
      !error.config?.url?.startsWith("/auth/") &&
      error.config?.sessionVersion === session().sessionVersion
    )
      expire();
    return Promise.reject(error);
  },
);
export default client;
