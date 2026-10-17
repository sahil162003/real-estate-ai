
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
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? "Signing in..." : "Sign In"}
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
