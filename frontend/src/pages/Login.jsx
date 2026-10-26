import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isNewUserChecked, setIsNewUserChecked] = useState(false);
  const navigate = useNavigate();
  const { initiatePhoneLogin } = useAuth();

  // Validate Bangladeshi phone number: 11 digits starting with 013-019
  const cleanDigits = phone.replace(/\D/g, "");
  const isValidBdPhone = /^01[3-9]\d{8}$/.test(cleanDigits);

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidBdPhone) {
      setError("Please enter a valid 11-digit Bangladeshi number (e.g., 01712-345678)");
      return;
    }

    const formatted = `+88${cleanDigits}`;
    initiatePhoneLogin(formatted);
    navigate("/otp", {
      state: {
        phone: formatted,
        cleanDigits,
        isNewUser: isNewUserChecked
      }
    });
  };

  const useQuickTestNumber = (number, isNew = false) => {
    setPhone(number);
    setIsNewUserChecked(isNew);
    setError("");
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="brand-mark" aria-hidden="true">অ</div>
        <h1 className="brand-title">Oporajito</h1>
        <p className="brand-sub">
          Hyperlocal skill sharing across Bangladesh. Learn a skill, teach a skill — no money involved.
        </p>
      </div>

      <div className="stitch-divider" />

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="phone-input">
          Mobile Number
        </label>

        <div className={`phone-input-container ${error ? "phone-input-container--error" : ""}`}>
          <div className="phone-prefix">
            <span className="bd-flag" aria-hidden="true">🇧🇩</span>
            <span>+88</span>
          </div>
          <input
            id="phone-input"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="01712-345678"
            value={phone}
            onChange={handlePhoneChange}
            aria-describedby={error ? "phone-error" : "phone-hint"}
          />
        </div>

        {error ? (
          <p id="phone-error" className="field-error">{error}</p>
        ) : (
          <p id="phone-hint" className="field-hint">
            Format: <strong>01XXXXXXXXX</strong> (11 digits, Grameenphone, Robi, Banglalink, Teletalk)
          </p>
        )}

        <div className="onboarding-toggle-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isNewUserChecked}
              onChange={(e) => setIsNewUserChecked(e.target.checked)}
            />
            <span>Simulate first-time registration (test Onboarding flow)</span>
          </label>
        </div>

        <button
          type="submit"
          className="primary-btn login-btn"
          disabled={!isValidBdPhone}
        >
          Send Verification Code
        </button>

        {/* Quick Dev Helpers */}
        <div className="dev-shortcuts-box">
          <span className="shortcuts-label">💡 Local Dev Shortcuts:</span>
          <div className="shortcut-buttons">
            <button
              type="button"
              className="shortcut-pill"
              onClick={() => useQuickTestNumber("01712345678", false)}
            >
              Existing: 01712345678
            </button>
            <button
              type="button"
              className="shortcut-pill shortcut-pill--new"
              onClick={() => useQuickTestNumber("01999888777", true)}
            >
              New User: 01999888777
            </button>
          </div>
        </div>

        <div className="safety-guarantee">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="var(--green-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Your phone number is strictly private and never shared with other users.</span>
        </div>
      </form>
    </div>
  );
}
