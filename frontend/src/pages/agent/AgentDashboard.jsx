
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "./AgentDashboard.css";

export default function AgentDashboard() {
  const { user } = useAuth();

  const displayName =
    user?.firstName ||
    user?.name ||
    user?.email ||
    "Agent";

  return (
    <main className="agent-dashboard">
      <header className="agent-dashboard-header">
        <div>
          <Link to="/agent/dashboard" className="agent-dashboard-brand">
            RealEstateAI
          </Link>

          <p className="agent-dashboard-eyebrow">
            AGENT WORKSPACE
          </p>

          <h1>Welcome, {displayName}</h1>

          <p className="agent-dashboard-subtitle">
            Manage your property listings from one place.
          </p>
        </div>

        <nav className="agent-dashboard-nav">
          <Link to="/agent/dashboard" className="active">
            Dashboard
          </Link>

          <Link to="/agent/properties">
            My Properties
          </Link>

          <Link to="/agent/properties/new">
            Add Property
          </Link>

          <Link to="/customer/profile">
            My Profile
          </Link>
        </nav>
      </header>

      <section className="agent-dashboard-welcome">
        <div>
          <span className="agent-dashboard-label">
            YOUR AGENT ACCOUNT
          </span>

          <h2>Manage your real estate business</h2>

          <p>
            Create property listings, keep your information updated,
            and manage the properties you publish on RealEstateAI.
          </p>

          <Link
            to="/agent/properties/new"
            className="agent-dashboard-primary-button"
          >
            + Add New Property
          </Link>
        </div>

        <div className="agent-dashboard-house-icon" aria-hidden="true">
          🏡
        </div>
      </section>

      <section className="agent-dashboard-section">
        <div className="agent-dashboard-section-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>Choose what you want to do next.</p>
          </div>
        </div>

        <div className="agent-dashboard-actions">
          <Link
            to="/agent/properties/new"
            className="agent-dashboard-action-card"
          >
            <span className="agent-dashboard-action-icon">＋</span>
            <h3>Add Property</h3>
            <p>Create a new property listing for customers to discover.</p>
            <span className="agent-dashboard-action-link">
              Create listing →
            </span>
          </Link>

          <Link
            to="/agent/properties"
            className="agent-dashboard-action-card"
          >
            <span className="agent-dashboard-action-icon">⌂</span>
            <h3>My Properties</h3>
            <p>View and manage your existing property listings.</p>
            <span className="agent-dashboard-action-link">
              View listings →
            </span>
          </Link>

          <Link
            to="/customer/profile"
            className="agent-dashboard-action-card"
          >
            <span className="agent-dashboard-action-icon">♙</span>
            <h3>My Profile</h3>
            <p>View or update your account information.</p>
            <span className="agent-dashboard-action-link">
              View profile →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
