
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { decodeJwt, isTokenExpired } from "../../utils/jwt";
import { useAuth } from "../../auth/AuthContext";

export default function GoogleOAuthCallback() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const processed = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = new URLSearchParams(
      window.location.hash.substring(1)
    ).get("token");

    // Remove the token from the browser address bar.
    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );

    if (!token) {
      setError("Google login did not return an authentication token.");
      return;
    }

    const payload = decodeJwt(token);

    if (!payload || isTokenExpired(token)) {
      setError("The Google login token is invalid or expired.");
      return;
    }

    const role = String(payload.role || "").replace(/^ROLE_/, "");

    if (!["ADMIN", "AGENT", "CUSTOMER"].includes(role)) {
      setError("Your account has an unsupported role.");
      return;
    }

    const currentUser = {
      email: payload.sub,
      role,
    };

    loginWithToken(token, currentUser);

    if (role === "ADMIN") {
      navigate("/admin", { replace: true });
    } else if (role === "AGENT") {
      navigate("/agent/dashboard", { replace: true });
    } else {
      navigate("/customer/search", { replace: true });
    }
  }, [loginWithToken, navigate]);

  if (error) {
    return (
      <main className="google-oauth-callback">
        <h2>Google Login Failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/login", { replace: true })}>
          Back to Login
        </button>
      </main>
    );
  }

  return (
    <main className="google-oauth-callback">
      <h2>Signing you in...</h2>
      <p>Please wait while we open your dashboard.</p>
    </main>
  );
}
