import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import { apiRequest } from "../utils/api";

const AuthPage = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await apiRequest("/auth/login", "POST", {
        identifier: identifier.trim(),
        password,
      });

      if (res.success) {
        Swal.fire({
          title: `Welcome Back!`,
          text: `Authenticated as ${res.name || "WELAMA Administrator"}`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "#ffffff",
          color: "#0A0A0A",
          iconColor: "#0A0A0A",
        });
        onLogin(res);
        navigate("/admin");
      } else {
        setError(res.message || "Invalid email/phone or password");
      }
    } catch (err) {
      setError(err.message || "Failed to connect to authentication service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split-page">
      {/* LEFT SIDE: Brand/Image Area */}
      <div className={`auth-split-left ${isLoaded ? "loaded" : ""}`}>
        <div className="auth-split-left-overlay"></div>
        <div className="auth-split-left-content">
          <Link to="/">
            <img src="/welamalogo.png" alt="WELAMA" className="auth-split-logo" />
          </Link>
          <div className="auth-split-hero-text">
            <h1 className="serif">Welcome Back</h1>
            <p>
              Log in to the portal to manage your store, inventory, orders, and
              customer relationships. The essence of luxury starts here.
            </p>
            <Link to="/" className="auth-split-outline-btn">
              <ArrowLeft size={16} /> Return to Storefront
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form Area */}
      <div className={`auth-split-right ${isLoaded ? "loaded" : ""}`}>
        <div className="auth-split-form-container">
          
          <div className="auth-split-header">
            <h2 className="serif">Sign In</h2>
            <p>Enter your management credentials to continue.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="auth-error-banner-white">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="auth-form-white">
            <div className="auth-field-white">
              <label htmlFor="admin-identifier">Email or Phone Number</label>
              <div className="auth-input-container-white">
                <User size={18} className="auth-field-icon-white" />
                <input
                  id="admin-identifier"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder="admin@welama.com or 0244374433"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError("");
                  }}
                />
              </div>
            </div>

            <div className="auth-field-white">
              <div className="auth-field-header-row-white">
                <label htmlFor="admin-password">Password</label>
              </div>
              <div className="auth-input-container-white">
                <Lock size={18} className="auth-field-icon-white" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                />
                <button
                  type="button"
                  className="auth-pwd-toggle-white"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-split-submit-btn"
              disabled={isSubmitting || !identifier || !password}
            >
              <span>{isSubmitting ? "Authenticating..." : "Sign In to Dashboard"}</span>
              {!isSubmitting && <ArrowRight size={17} />}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-split-footer">
            <div className="auth-security-note-white">
              <ShieldCheck size={14} color="#16a34a" />
              <span>256-bit Encrypted • Authorized Personnel Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
