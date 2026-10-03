const API_URL = import.meta.env.VITE_API_URL || "";

function getToken() {
  return localStorage.getItem("quad_token");
}

/**
 * A network-level failure (server down, DNS, offline, CORS) rejects fetch with
 * a TypeError whose message is the browser's own wording, usually the bare
 * string "Failed to fetch". That was reaching users verbatim in error banners.
 * Anything that is not an AbortError is translated here; an AbortError is
 * rethrown untouched because callers check for it by name to ignore their own
 * cancelled requests.
 */
function networkError(err) {
  if (err && err.name === "AbortError") return err;
  return new Error("Could not reach The Quad. Check your connection and try again.");
}

async function request(path, { method = "GET", body, auth = true, signal } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      signal,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (err) {
    throw networkError(err);
  }
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    throw new Error((data && data.error) || "Something went wrong. Please try again.");
  }
  return data;
}

async function upload(path, formData, { method = "POST" } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, { method, headers, body: formData });
  } catch (err) {
    throw networkError(err);
  }
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) throw new Error((data && data.error) || "Upload failed. Please try again.");
  return data;
}

export const api = {
  get: (path, opts) => request(path, opts),
  /**
   * Site search. Takes an AbortSignal because the search box fires on every
   * keystroke: without it, a slow response to an earlier query can land after
   * a faster response to a later one and overwrite the newer results.
   */
  search: (q, signal) => request(`/search?q=${encodeURIComponent(q)}`, { signal }),
  post: (path, body, opts) => request(path, { method: "POST", body, ...opts }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  del: (path) => request(path, { method: "DELETE" }),
  upload: (path, formData, opts) => upload(path, formData, opts)
};

export { API_URL, getToken };
