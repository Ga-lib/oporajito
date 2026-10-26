import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { chatApi } from "../api";
import "./ChatThread.css";

export default function ChatThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, sendChatMessage } = useApp();

  const convo = conversations.find((c) => c.id === id) || conversations[0];
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(() => convo?.messages || []);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // Sync messages if conversation changes in context
  useEffect(() => {
    if (convo?.messages && convo.messages.length > 0) {
      setMessages((prev) => (prev.length === 0 ? convo.messages : prev));
    }
  }, [convo]);

  // Load message history from MongoDB & connect WebSocket
  useEffect(() => {
    if (!convo?.id) return;

    // 1. Fetch historical messages from backend
    chatApi.getMessages(convo.id)
      .then((data) => {
        if (data && data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
      })
      .catch((e) => {
        console.info("Using cached messages:", e.message);
      });

    // 2. Connect WebSocket
    const token = localStorage.getItem("oporajito_auth_token") || "dev-token-+8801712345678";
    try {
      const wsUrl = chatApi.getWebSocketUrl(convo.id, encodeURIComponent(token));
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const incoming = JSON.parse(event.data);
          if (incoming && incoming.text) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              return [...prev, incoming];
            });
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (err) => {
        console.info("WebSocket unavailable, falling back to REST messaging");
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      };
    } catch (e) {
      console.warn("WebSocket initialization error:", e.message);
    }
  }, [convo?.id]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!convo) {
    return (
      <div className="thread-page">
        <div className="thread-header">
          <button className="thread-back" onClick={() => navigate("/chat")}>←</button>
          <span>Conversation not found</span>
        </div>
      </div>
    );
  }

  const handleSend = (e) => {
    if (e) e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const optimisticMsg = {
      id: `msg-${Date.now()}`,
      conversation_id: convo.id,
      sender_id: user?.id || "user-current",
      text,
      created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setDraft("");

    // Send via WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text }));
    } else {
      // Fallback to REST API
      chatApi.sendMessage(convo.id, text).catch((err) => {
        console.warn("REST message send fallback:", err.message);
      });
    }

    sendChatMessage(convo.id, text);
  };

  const partnerId = convo.participant_id || "user-1";
  const displayMessages = messages.length > 0 ? messages : (convo.messages || []);

  return (
    <div className="thread-page-wrapper">
      <div className="thread-page">
      {/* Header */}
      <div className="thread-header">
        <button className="thread-back" onClick={() => navigate("/chat")} aria-label="Back to chats">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="thread-partner-info" onClick={() => navigate(`/profile/${partnerId}`)}>
          <div className="thread-avatar">{convo.avatar}</div>
          <div className="thread-name-box">
            <span className="thread-name">{convo.name}</span>
            <span className="thread-sub-status">Active neighbor • Tap for profile</span>
          </div>
        </div>

        <button
          className="thread-profile-link-btn"
          onClick={() => navigate(`/profile/${partnerId}`)}
          title="View profile"
        >
          View Profile
        </button>
      </div>

      {/* Safety Banner */}
      <div className="thread-notice">
        <span className="notice-icon">🔒</span>
        <span>
          Phone numbers remain private. Meet during daytime in public neighborhood spots.
        </span>
      </div>

      {/* Messages Feed */}
      <div className="thread-messages">
        {displayMessages.map((m) => {
          const isMe = m.sender_id === (user?.id || "user-current") || m.from === "me";

          return (
            <div
              key={m.id}
              className={`bubble-row ${isMe ? "bubble-row--me" : "bubble-row--them"}`}
            >
              <div className={`bubble ${isMe ? "bubble--me" : "bubble--them"}`}>
                <p className="bubble-text">{m.text}</p>
                {m.created_at && (
                  <span className="bubble-time">{m.created_at}</span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <form className="thread-composer" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Message text"
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!draft.trim()}
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 20l17-8L4 4l0 6.5L15 12 4 13.5 4 20z" fill="#FFFFFF" />
          </svg>
        </button>
      </form>
    </div>
  </div>
);
}
