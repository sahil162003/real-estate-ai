
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

    try {
      console.log("Google callback started");
      console.log("Callback URL:", window.location.href);

      const token = new URLSearchParams(
        window.location.hash.substring(1)
      ).get("token");

      if (!token) {
        throw new Error("JWT token is missing from callback URL");
      }

      const payload = decodeJwt(token);

      if (!payload) {
        throw new Error("Unable to decode JWT token");
      }

      if (isTokenExpired(token)) {
        throw new Error("JWT token has expired");
      }

      const role = String(payload.role || "")
        .replace(/^ROLE_/, "")
        .toUpperCase();

      if (!payload.sub) {
        throw new Error("JWT subject/email is missing");
      }

      if (!["ADMIN", "AGENT", "CUSTOMER"].includes(role)) {
        throw new Error("Unsupported user role: " + role);
      }

      const currentUser = {
        email: payload.sub,
        role
      };

      loginWithToken(token, currentUser);

      // Remove the token from the address bar after storing it.
      window.history.replaceState(
        null,
        "",
        window.location.pathname
      );

      console.log("Google authentication successful");
      console.log("Stored token:", !!sessionStorage.getItem("token"));
      console.log("Stored user:", sessionStorage.getItem("user"));

      if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (role === "AGENT") {
        navigate("/agent/dashboard", { replace: true });
      } else {
        navigate("/customer/search", { replace: true });
      }

    } catch (err) {
      console.error("Google OAuth callback error:", err);
      setError(err.message || "Google authentication failed");
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
