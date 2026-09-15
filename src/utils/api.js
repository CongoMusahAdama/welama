export const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.origin.includes("localhost")
    ? "http://localhost:5000/api"
    : "https://welama.onrender.com/api");

export const apiRequest = async (endpoint, method = "GET", body = null, timeoutMs = 7000) => {
  let token = null;
  try {
    token = localStorage.getItem("welama_auth_token");
  } catch (e) {
    console.warn("Storage access blocked", e);
  }
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const config = {
    method,
    headers,
    credentials: "include", // Important for httpOnly cookies
    signal: controller.signal,
    ...(body && { body: JSON.stringify(body) }),
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, config);
    return await res.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return { success: false, message: "Server connection failed" };
  } finally {
    clearTimeout(timer);
  }
};
