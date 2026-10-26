// Base API Client for Oporajito (FastAPI backend /api/v1)

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

let authToken = null;

export function setApiAuthToken(token) {
  authToken = token;
}

export async function apiClient(endpoint, { method = "GET", body = null, headers = {} } = {}) {
  const reqHeaders = {
    "Content-Type": "application/json",
    ...headers
  };

  if (authToken) {
    reqHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  const config = {
    method,
    headers: reqHeaders
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorDetail = "API Request failed";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch (e) {
      // fallback to status text
      errorDetail = response.statusText;
    }
    const error = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }

  return response.json();
}
