import React, { createContext, useContext, useState, useEffect } from "react";
import { currentUser } from "../data/mockData";
import { authApi, usersApi } from "../api";
import { setApiAuthToken } from "../api/client";

const AuthContext = createContext(null);

const STORAGE_USER_KEY = "oporajito_auth_user";
const STORAGE_TOKEN_KEY = "oporajito_auth_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading auth state from localStorage", e);
    }
    return currentUser;
  });

  const [pendingPhone, setPendingPhone] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(user && user.id);
  });
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return Boolean(user && user.name && user.district);
  });

  // Sync token to API client on startup
  useEffect(() => {
    let savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!savedToken) {
      // Provide default dev token for local demo browsing
      savedToken = "dev-token-+8801712345678";
      localStorage.setItem(STORAGE_TOKEN_KEY, savedToken);
    }
    setApiAuthToken(savedToken);

    // Fetch latest profile from MongoDB
    usersApi.getMe()
      .then((freshUser) => {
        if (freshUser && freshUser.id) {
          setUser(freshUser);
          setIsAuthenticated(true);
          setIsOnboarded(Boolean(freshUser.name && freshUser.district));
        }
      })
      .catch((err) => {
        console.info("Using cached profile on start:", err.message);
      });
  }, []);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      } catch (e) {
        console.error("Failed to cache user", e);
      }
      setIsAuthenticated(true);
      setIsOnboarded(Boolean(user.name && user.district));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      setApiAuthToken(null);
      setIsAuthenticated(false);
      setIsOnboarded(false);
    }
  }, [user]);

  // Phone Login initiation
  const initiatePhoneLogin = (phone) => {
    setPendingPhone(phone);
    return true;
  };

  // OTP Verification with FastAPI backend + MongoDB
  const verifyOtp = async (code, isNewUser = false) => {
    if (code.length !== 6) {
      throw new Error("Please enter a valid 6-digit OTP code");
    }

    const phoneToVerify = pendingPhone || "+8801712345678";
    const devToken = `dev-token-${phoneToVerify}`;

    try {
      // Call backend FastAPI endpoint /api/v1/auth/verify
      const res = await authApi.verifyToken(devToken);
      if (res && res.token) {
        setApiAuthToken(res.token);
        localStorage.setItem(STORAGE_TOKEN_KEY, res.token);
        setUser(res.user);
        setIsAuthenticated(true);
        const onboarded = Boolean(res.user.name && res.user.district);
        setIsOnboarded(onboarded);
        return { isNewUser: res.is_new_user || !onboarded, user: res.user };
      }
    } catch (apiErr) {
      console.warn("Backend auth verification failed or unavailable, falling back to local session:", apiErr.message);
    }

    // Local fallback if backend is offline
    if (isNewUser) {
      const newUser = {
        id: `user-${Date.now()}`,
        phone: phoneToVerify,
        name: "",
        district: "",
        area: "",
        avatar: "🧑🏽‍💻",
        bio: "",
        teaches: [],
        wants: [],
        rating_avg: 5.0,
        rating_count: 0,
        created_at: new Date().toISOString()
      };
      setUser(newUser);
      setIsAuthenticated(true);
      setIsOnboarded(false);
      return { isNewUser: true, user: newUser };
    }

    const existing = {
      ...currentUser,
      phone: phoneToVerify
    };
    setUser(existing);
    setIsAuthenticated(true);
    setIsOnboarded(true);
    return { isNewUser: false, user: existing };
  };

  // Complete onboarding for first-time login
  const completeOnboarding = async (profileData) => {
    try {
      const updatedBackend = await usersApi.updateMe(profileData);
      if (updatedBackend && updatedBackend.id) {
        setUser(updatedBackend);
        setIsOnboarded(true);
        return updatedBackend;
      }
    } catch (err) {
      console.warn("Could not sync onboarding to backend, using local state:", err.message);
    }

    const updated = {
      ...user,
      ...profileData,
      rating_avg: 5.0,
      rating_count: 0,
      created_at: new Date().toISOString()
    };
    setUser(updated);
    setIsOnboarded(true);
    return updated;
  };

  // Update profile
  const updateProfile = async (updates) => {
    try {
      const updatedBackend = await usersApi.updateMe(updates);
      if (updatedBackend && updatedBackend.id) {
        setUser(updatedBackend);
        return updatedBackend;
      }
    } catch (err) {
      console.warn("Could not update profile on backend, using local state:", err.message);
    }

    setUser((prev) => ({
      ...prev,
      ...updates
    }));
  };

  // Logout
  const logout = () => {
    setUser(null);
    setPendingPhone("");
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    setApiAuthToken(null);
  };

  // Reset to default demo user
  const resetDemoUser = () => {
    setUser(currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        pendingPhone,
        isAuthenticated,
        isOnboarded,
        initiatePhoneLogin,
        verifyOtp,
        completeOnboarding,
        updateProfile,
        logout,
        resetDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

