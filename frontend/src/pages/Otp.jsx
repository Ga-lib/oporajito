import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Otp.css";

export default function Otp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();

  const phone = state?.phone || "+8801712345678";
  const isNewUserFlag = Boolean(state?.isNewUser);

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    // Only allow single digit
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const nextDigits = [...digits];
    nextDigits[index] = cleaned.slice(-1);
    setDigits(nextDigits);
    if (error) setError("");

    // Auto-advance to next input
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasted[i] || "";
    }
    setDigits(nextDigits);
    if (pasted.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setTimer(30);
    setCanResend(false);
    setError("");
    setDigits(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit OTP code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const res = await verifyOtp(code, isNewUserFlag);
      if (res && res.isNewUser) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Failed to verify OTP. Please try again.");
      setIsVerifying(false);
    }
  };

  const fillTestOtp = () => {
    const testCode = ["1", "2", "3", "4", "5", "6"];
    setDigits(testCode);
    setError("");
  };

  const isComplete = digits.every((d) => d !== "");

  return (
    <div className="otp-page">
      <button className="back-link" onClick={() => navigate("/login")}>
        ← Change number
      </button>

      <div className="otp-header">
        <h1 className="otp-title">Enter Verification Code</h1>
        <p className="otp-sub">
          We sent a 6-digit code via SMS to <strong>{phone}</strong>
        </p>
      </div>

      <div className="otp-inputs" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`otp-digit ${error ? "otp-digit--error" : ""}`}
            autoFocus={i === 0}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      {error && <p className="otp-error-msg">{error}</p>}

      <button
        type="button"
        className="primary-btn verify-btn"
        disabled={!isComplete || isVerifying}
        onClick={handleVerify}
      >
        {isVerifying ? "Verifying..." : "Verify & Continue"}
      </button>

      <div className="otp-resend-row">
        {canResend ? (
          <button type="button" className="resend-btn" onClick={handleResend}>
            Resend SMS Code
          </button>
        ) : (
          <p className="otp-countdown">
            Didn't receive code? Resend in <span>0:{timer < 10 ? `0${timer}` : timer}</span>
          </p>
        )}
      </div>

      {/* Test helper */}
      <div className="otp-helper-card">
        <p className="helper-label">🧪 Test Helper:</p>
        <button type="button" className="fill-code-btn" onClick={fillTestOtp}>
          Auto-fill test OTP (123456)
        </button>
      </div>
    </div>
  );
}
