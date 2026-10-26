import React from "react";
import { HashRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider, useApp } from "./context/AppContext";

import Login from "./pages/Login";
import Otp from "./pages/Otp";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Requests from "./pages/Requests";
import ChatList from "./pages/ChatList";
import ChatThread from "./pages/ChatThread";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Notifications from "./pages/Notifications";

import BottomNav from "./components/BottomNav";
import Toast from "./components/Toast";

function AppShell() {
  const location = useLocation();
  const { toast, closeToast } = useApp();

  // BottomNav shows on main navigation tabs only on mobile screens
  const isNavVisible = ["/home", "/requests", "/chat", "/profile"].some((p) =>
    location.pathname === p
  );

  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<Otp />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Core App Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:id" element={<ChatThread />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      {/* Global Floating Toast */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Persistent Bottom Nav (Visible on Mobile only via CSS) */}
      {isNavVisible && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <AppShell />
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
}
