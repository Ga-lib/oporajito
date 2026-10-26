import { apiClient } from "./client";

export const authApi = {
  verifyToken: (firebaseIdToken) =>
    apiClient("/auth/verify", {
      method: "POST",
      body: { id_token: firebaseIdToken }
    })
};

export const usersApi = {
  getMe: () => apiClient("/users/me"),
  updateMe: (data) => apiClient("/users/me", { method: "PUT", body: data }),
  getUser: (id) => apiClient(`/users/${id}`),
  searchUsers: ({ query = "", district = "", skill = "", page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (district) params.append("district", district);
    if (skill) params.append("skill", skill);
    params.append("page", page);
    params.append("limit", limit);
    return apiClient(`/users?${params.toString()}`);
  },
  getMatches: (limit = 10) => apiClient(`/users/matches?limit=${limit}`),
  blockUser: (id) => apiClient(`/users/${id}/block`, { method: "POST" }),
  reportUser: (id, data) => apiClient(`/users/${id}/report`, { method: "POST", body: data })
};

export const requestsApi = {
  createRequest: (data) => apiClient("/requests", { method: "POST", body: data }),
  getRequests: (box = "incoming") => apiClient(`/requests?box=${box}`),
  updateRequest: (id, status) =>
    apiClient(`/requests/${id}`, {
      method: "PATCH",
      body: { status }
    })
};

export const chatApi = {
  getConversations: () => apiClient("/conversations"),
  getMessages: (conversationId) => apiClient(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, text) =>
    apiClient(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: { text }
    }),
  getWebSocketUrl: (conversationId, token) => {
    const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = import.meta.env.VITE_WS_HOST || "127.0.0.1:8000";
    return `${wsProto}//${host}/api/v1/ws/chat?token=${token}&conversation_id=${conversationId}`;
  }
};

export const reviewsApi = {
  createReview: (data) => apiClient("/reviews", { method: "POST", body: data }),
  getUserReviews: (userId) => apiClient(`/users/${userId}/reviews`)
};

export const notificationsApi = {
  getNotifications: () => apiClient("/notifications"),
  markAsRead: (id) => apiClient(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllAsRead: () => apiClient("/notifications/read-all", { method: "PATCH" })
};

