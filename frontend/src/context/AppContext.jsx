import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { neighbors as initialNeighbors, initialRequests, initialConversations, initialNotifications } from "../data/mockData";
import { useAuth } from "./AuthContext";
import { usersApi, requestsApi, notificationsApi, chatApi, reviewsApi } from "../api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();

  const [neighborsList, setNeighborsList] = useState(initialNeighbors);
  const [requests, setRequests] = useState(initialRequests);
  const [conversations, setConversations] = useState(initialConversations);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const [toast, setToast] = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("oporajito_theme") || "light";
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("oporajito_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 2500);
  };

  // Load real neighbors from MongoDB via FastAPI on startup
  useEffect(() => {
    usersApi.searchUsers({ limit: 50 })
      .then((data) => {
        if (data && data.users && data.users.length > 0) {
          setNeighborsList(data.users);
        }
      })
      .catch((err) => {
        console.warn("Could not load neighbors from MongoDB API, using mockData fallback:", err.message);
      });
  }, []);

  // Fetch user requests & notifications whenever user authentication changes
  useEffect(() => {
    if (!user || !user.id) return;

    // Load incoming & outgoing requests
    Promise.allSettled([
      requestsApi.getRequests("incoming"),
      requestsApi.getRequests("outgoing")
    ]).then(([incRes, outRes]) => {
      const incoming = incRes.status === "fulfilled" && incRes.value?.requests ? incRes.value.requests : [];
      const outgoing = outRes.status === "fulfilled" && outRes.value?.requests ? outRes.value.requests : [];
      const combined = [...incoming, ...outgoing];
      if (combined.length > 0) {
        setRequests(combined);
      }
    }).catch((e) => {
      console.warn("Could not load requests from backend:", e.message);
    });

    // Load notifications
    notificationsApi.getNotifications()
      .then((data) => {
        if (data && data.notifications && data.notifications.length > 0) {
          setNotifications(data.notifications);
        }
      })
      .catch((e) => {
        console.warn("Could not load notifications from backend:", e.message);
      });
  }, [user]);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3000);
  };

  const closeToast = () => setToast(null);

  // Send a new skill swap request
  const sendSwapRequest = async ({ toNeighbor, skill, offeredSkill, message }) => {
    const fallbackId = `req-${Date.now()}`;
    let newRequest = {
      id: fallbackId,
      from_user_id: user?.id || "user-current",
      from_user_name: user?.name || "Anonymous Neighbor",
      from_user_avatar: user?.avatar || "🧑🏽‍💻",
      from_user_area: user ? `${user.area}, ${user.district}` : "Dhaka",
      to_user_id: toNeighbor.id,
      to_user_name: toNeighbor.name,
      to_user_avatar: toNeighbor.avatar,
      to_user_area: toNeighbor.area,
      skill,
      offered_skill: offeredSkill || (user?.teaches?.[0] ?? "Skills exchange"),
      message: message.trim(),
      status: "pending",
      created_at: "Just now"
    };

    try {
      const created = await requestsApi.createRequest({
        to_user_id: toNeighbor.id,
        skill,
        offered_skill: offeredSkill,
        message: message.trim()
      });
      if (created && created.id) {
        newRequest = created;
      }
    } catch (err) {
      console.warn("Backend request creation failed or offline, kept in local state:", err.message);
    }

    setRequests((prev) => [newRequest, ...prev]);

    // Local confirmation notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: "request_received",
      title: "Swap Request Sent",
      message: `Your request was sent to ${toNeighbor.name} for "${skill}".`,
      created_at: "Just now",
      read: false,
      link: "/requests"
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Request sent to ${toNeighbor.name.split(" ")[0]}!`, "success");
    triggerConfetti();
    return newRequest;
  };

  // Accept a skill swap request -> creates or opens conversation
  const acceptSwapRequest = async (requestId) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return;

    try {
      await requestsApi.updateRequest(requestId, "accepted");
    } catch (err) {
      console.warn("Backend accept request failed, updating locally:", err.message);
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "accepted" } : r))
    );

    // Check if conversation exists
    let existingConvo = conversations.find(
      (c) => c.participant_id === target.from_user_id || c.name === target.from_user_name
    );

    if (!existingConvo) {
      existingConvo = {
        id: `convo-${Date.now()}`,
        participant_id: target.from_user_id,
        name: target.from_user_name,
        avatar: target.from_user_avatar,
        area: target.from_user_area,
        skill_topic: `${target.skill} Swap`,
        lastMessage: "Request accepted! Let's arrange a time to meet.",
        last_message_at: "Just now",
        unread: 0,
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender_id: user?.id || "user-current",
            text: `Hi ${target.from_user_name.split(" ")[0]}, I accepted your swap request for "${target.skill}". Looking forward to it!`,
            created_at: "Just now"
          }
        ]
      };
      setConversations((prev) => [existingConvo, ...prev]);
    }

    const newNotif = {
      id: `notif-${Date.now()}`,
      type: "request_accepted",
      title: "Request Accepted",
      message: `You accepted ${target.from_user_name}'s swap request. Chat is ready!`,
      created_at: "Just now",
      read: false,
      link: `/chat/${existingConvo.id}`
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Accepted! Conversation created with ${target.from_user_name}.`, "success");
  };

  // Decline request
  const declineSwapRequest = async (requestId) => {
    try {
      await requestsApi.updateRequest(requestId, "declined");
    } catch (err) {
      console.warn("Backend decline request failed, updating locally:", err.message);
    }
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "declined" } : r))
    );
    showToast("Request declined", "info");
  };

  // Mark request completed
  const completeSwapRequest = async (requestId) => {
    try {
      await requestsApi.updateRequest(requestId, "completed");
    } catch (err) {
      console.warn("Backend complete request failed, updating locally:", err.message);
    }
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "completed" } : r))
    );
    showToast("Skill swap marked as completed! You can now leave a review.", "success");
  };

  // Send message in chat thread
  const sendChatMessage = (conversationId, text) => {
    if (!text.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender_id: user?.id || "user-current",
      text: text.trim(),
      created_at: "Just now"
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text.trim(),
            last_message_at: "Just now",
            messages: [...c.messages, newMessage]
          };
        }
        return c;
      })
    );

    // Simulate smart neighbor response after 2 seconds for prototype feel
    setTimeout(() => {
      const neighborReply = {
        id: `msg-reply-${Date.now()}`,
        sender_id: "them",
        text: "Got it! Looking forward to learning together.",
        created_at: "Just now"
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: neighborReply.text,
              last_message_at: "Just now",
              messages: [...c.messages, neighborReply]
            };
          }
          return c;
        })
      );
    }, 2200);
  };

  // Submit review for completed swap
  const submitReview = async ({ requestId, revieweeId, rating, comment }) => {
    try {
      await reviewsApi.createReview({
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim(),
        request_id: requestId
      });
    } catch (e) {
      console.warn("Backend review submit failed, updating locally:", e.message);
    }

    const targetNeighbor = neighborsList.find((n) => n.id === revieweeId);
    const newRev = {
      id: `rev-${Date.now()}`,
      reviewer_name: user?.name || "Rafiq Islam",
      reviewer_avatar: user?.avatar || "🧑🏽‍💻",
      rating,
      comment: comment.trim(),
      created_at: "Just now"
    };

    if (targetNeighbor) {
      setNeighborsList((prev) =>
        prev.map((n) => {
          if (n.id === revieweeId) {
            const updatedReviews = [newRev, ...(n.reviews || [])];
            const newCount = (n.rating_count || 0) + 1;
            const newAvg = Number(
              (((n.rating_avg || 5.0) * (n.rating_count || 0) + rating) / newCount).toFixed(1)
            );
            return {
              ...n,
              reviews: updatedReviews,
              rating_avg: newAvg,
              rating_count: newCount
            };
          }
          return n;
        })
      );
    }

    // Add notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: "review_received",
      title: "Review Published",
      message: `Your ${rating}-star review for ${targetNeighbor?.name || "your neighbor"} has been posted!`,
      created_at: "Just now",
      read: false,
      link: `/profile/${revieweeId}`
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast("Review submitted successfully! Thank you.", "success");
  };

  // Notifications
  const markNotificationRead = async (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    try {
      await notificationsApi.markAsRead(notifId);
    } catch (e) {
      console.warn("Backend mark notification read failed, marked locally:", e.message);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationsApi.markAllAsRead();
    } catch (e) {
      console.warn("Backend mark all notifications read failed, marked locally:", e.message);
    }
    showToast("All notifications marked as read", "info");
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const pendingRequestsCount = useMemo(() => {
    return requests.filter(
      (r) => r.to_user_id === (user?.id || "user-current") && r.status === "pending"
    ).length;
  }, [requests, user]);

  const unreadMessagesCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unread || 0), 0);
  }, [conversations]);

  // Block & Report safety features
  const blockUser = async (userId) => {
    setBlockedUserIds((prev) => [...prev, userId]);
    try {
      await usersApi.blockUser(userId);
    } catch (e) {
      console.warn("Backend blockUser request failed, blocked locally:", e.message);
    }
    showToast("User blocked. They will no longer appear in your feed or chats.", "info");
  };

  const reportUser = async ({ userId, reason, details }) => {
    try {
      await usersApi.reportUser(userId, { reason, details });
    } catch (e) {
      console.warn("Backend reportUser request failed:", e.message);
    }
    showToast("Report submitted to community moderation. Thank you for keeping Oporajito safe.", "info");
  };

  // Visible neighbors excluding blocked ones
  const visibleNeighbors = useMemo(() => {
    return neighborsList.filter((n) => !blockedUserIds.includes(n.id));
  }, [neighborsList, blockedUserIds]);

  return (
    <AppContext.Provider
      value={{
        neighbors: visibleNeighbors,
        requests,
        conversations,
        notifications,
        unreadNotificationsCount,
        pendingRequestsCount,
        unreadMessagesCount,
        toast,
        showToast,
        closeToast,
        sendSwapRequest,
        acceptSwapRequest,
        declineSwapRequest,
        completeSwapRequest,
        sendChatMessage,
        submitReview,
        markNotificationRead,
        markAllNotificationsRead,
        blockUser,
        reportUser,
        theme,
        toggleTheme,
        confettiActive,
        triggerConfetti
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
