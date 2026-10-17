
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import authService from "../../api/services/authService";
import "./RegisterPage.css";

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
  address: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.phoneNumber.trim() ||
      !formData.address.trim()
    ) {
      return "Please fill in all fields.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (
      formData.password.length < 8 ||
      formData.password.length > 100
    ) {
      return "Password must contain between 8 and 100 characters.";
    }

    if (!/^[6-9]\d{9}$/.test(formData.phoneNumber.trim())) {
      return "Enter a valid 10-digit Indian mobile number.";
    }

    if (formData.address.trim().length > 255) {
      return "Address cannot exceed 255 characters.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
      };

      await authService.register(registrationData);

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { registered: true },
        });
      }, 1200);
    } catch (err) {
      const responseData = err.response?.data;
      const message =
        responseData?.message ||
        (typeof responseData === "string" ? responseData : "") ||
        "Registration failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-card">
        <header className="register-brand">
          <h1 className="register-brand-name">RealEstateAI</h1>
          <p className="register-brand-subtitle">
            Find a place to call home.
          </p>
        </header>

        <h2 className="register-heading">Create Your Account</h2>
        <p className="register-description">
          Join RealEstateAI to discover properties and manage your account.
        </p>

        {error && (
          <div className="register-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="register-success" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-name-row">
            <div className="register-field">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
                maxLength={100}
                disabled={loading}
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
                maxLength={100}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              maxLength={100}
              disabled={loading}
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="phoneNumber">Mobile number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10-digit mobile number"
              value={formData.phoneNumber}
              onChange={handleChange}
              maxLength={10}
              pattern="[6-9][0-9]{9}"
              disabled={loading}
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              autoComplete="street-address"
              placeholder="Enter your full address"
              value={formData.address}
              onChange={handleChange}
              maxLength={255}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
