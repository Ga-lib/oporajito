import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import AppHeader from "../components/AppHeader";
import "./ChatList.css";

export default function ChatList() {
  const navigate = useNavigate();
  const { conversations } = useApp();
  const [search, setSearch] = useState("");

  const filteredConversations = conversations.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q) ||
      c.skill_topic?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="chatlist-page">
      <AppHeader title="Chats" />

      <div className="chatlist-content container-narrow">
        {/* Safety Tip Banner */}
        <div className="chat-safety-banner">
          <div className="safety-icon-bubble">🛡️</div>
          <div className="safety-text">
            <strong>Privacy & Safety First:</strong>
            <p>Phone numbers are strictly hidden. When meeting for the first skill session, choose a public neighborhood spot like a tea stall, campus library, or park.</p>
          </div>
        </div>

        {/* Chat Search */}
        <div className="chat-search-bar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="var(--ink-soft)" strokeWidth="2" />
            <path d="m21 21-3.5-3.5" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredConversations.length === 0 ? (
          <div className="empty-box">
            <span className="empty-icon">💬</span>
            <h3 className="empty-title">No conversations found</h3>
            <p className="empty-desc">
              {search
                ? `No chats match "${search}".`
                : "When you accept a skill swap request, your chat room will open here."}
            </p>
          </div>
        ) : (
          <div className="chat-rows">
            {filteredConversations.map((c) => (
              <button
                key={c.id}
                className="chat-row"
                onClick={() => navigate(`/chat/${c.id}`)}
              >
                <div className="chat-avatar">{c.avatar}</div>
                <div className="chat-row-main">
                  <div className="chat-row-top">
                    <span className="chat-row-name">{c.name}</span>
                    <span className="chat-row-time">{c.last_message_at || c.time}</span>
                  </div>
                  {c.skill_topic && (
                    <span className="chat-topic-tag">{c.skill_topic}</span>
                  )}
                  <div className="chat-row-bottom">
                    <span className="chat-row-last">{c.lastMessage}</span>
                    {c.unread > 0 && <span className="chat-unread">{c.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
