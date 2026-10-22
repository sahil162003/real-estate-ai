
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const requestedPath = location.state?.from?.pathname;
  const registered = location.state?.registered === true;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (
        requestedPath &&
        requestedPath.startsWith("/") &&
        !requestedPath.startsWith("//") &&
        requestedPath !== "/login" &&
        requestedPath !== "/register"
      ) {
        navigate(requestedPath, { replace: true });
      } else if (user.role === "ADMIN") {
        navigate("/admin/applications", { replace: true });
      } else if (user.role === "AGENT") {
        navigate("/agent/properties", { replace: true });
      } else if (user.role === "CUSTOMER") {
        navigate("/customer/search", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Login failed. Please check your email and password.";

      setError(
        typeof message === "string"
          ? message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <header className="login-brand">
          <h1 className="login-brand-name">RealEstateAI</h1>
          <p className="login-brand-subtitle">
            Find a place to call home.
          </p>
        </header>

        <h2 className="login-heading">Welcome Back</h2>
        <p className="login-description">
          Sign in to manage your account and explore properties.
        </p>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        {registered && (
          <div className="login-success" role="status">
            Account created successfully. Please sign in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>

            <div className="login-password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                    <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 9 4.5 10 7-0.5 1.2-1.4 2.6-2.8 3.8" />
                    <path d="M6.2 6.2C3.9 7.7 2.5 10 2 12c1 2.5 5 7 10 7 1 0 2-.2 2.9-.5" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          
<div className="google-login-divider">
  <span>OR</span>
</div>

<button
  type="button"
  className="google-login-button"
  onClick={() => {
    window.location.href =
      "http://localhost:8081/oauth2/authorization/google";
  }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="20"
    height="20"
    aria-hidden="true"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.16 13.22l7.98 6.19C13.03 13.72 18.05 9.5 24 9.5z"
      transform="translate(0 4)"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.75 7.18l7.73 6C44.42 37.95 46.98 31.8 46.98 24.55z"
      transform="translate(0 0)"
    />
    <path
      fill="#FBBC05"
      d="M10.14 28.59A14.4 14.4 0 0 1 9.4 24c0-1.59.27-3.13.74-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.58-6.19z"
      transform="translate(0 0)"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-5.95 0-10.97-4.22-12.86-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      transform="translate(0 0)"
    />
  </svg>

  <span>Continue with Google</span>
</button>

        </form>

        <p className="login-footer">
          Don't have an account?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
