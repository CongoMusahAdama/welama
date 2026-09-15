export const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.origin.includes("localhost")
    ? "http://localhost:5000/api"
    : "https://welama.onrender.com/api");

export const apiRequest = async (endpoint, method = "GET", body = null, timeoutMs) => {
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

  const isPayment = String(endpoint).includes("/payment/");
  const isOrderWrite = method !== "GET" && String(endpoint).startsWith("/orders");
  const waitMs = timeoutMs ?? (isPayment || isOrderWrite ? 28000 : 10000);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), waitMs);

  const config = {
    method,
    headers,
    credentials: "include",
    signal: controller.signal,
    ...(body && { body: JSON.stringify(body) }),
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, config);
    const text = await res.text();
    if (!text) {
      return { success: false, message: "Empty response from server. Please try again." };
    }
    try {
      return JSON.parse(text);
    } catch {
      return {
        success: false,
        message: res.ok
          ? "The server sent an unexpected response. Please try again."
          : "Server connection failed",
      };
    }
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    if (error?.name === "AbortError") {
      return { success: false, message: "The server took too long. Please try again." };
    }
    return { success: false, message: "Server connection failed" };
  } finally {
    clearTimeout(timer);
  }
};
