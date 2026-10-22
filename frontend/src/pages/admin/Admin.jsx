
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import AdminApplications from "./AdminApplications";
import AdminCustomers from "./AdminCustomers";
import AdminAgents from "./AdminAgents";
import "./Admin.css";
import AdminProperties from "./AdminProperties";
import AdminInquiries from "./AdminInquiries";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "applications", label: "Agent Applications", icon: "▤" },
  { id: "customers", label: "Manage Customers", icon: "♙" },
  { id: "agents", label: "Manage Agents", icon: "♧" },
  { id: "properties", label: "Manage Properties", icon: "⌂" },
  { id: "inquiries", label: "Manage Inquiries", icon: "✉" },
];

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");

  const displayName =
    user?.firstName ||
    user?.name ||
    user?.email ||
    "Administrator";

  const activeLabel =
    NAV_ITEMS.find((item) => item.id === activeSection)?.label ||
    "Admin Dashboard";

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <Link
          to="/admin"
          className="admin-sidebar-brand"
          onClick={() => setActiveSection("dashboard")}
        >
          <span className="admin-brand-icon">R</span>
          <span>RealEstateAI</span>
        </Link>

        <div className="admin-sidebar-profile">
          <div className="admin-profile-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{displayName}</strong>
            <span>Administrator</span>
          </div>
        </div>

        <p className="admin-sidebar-heading">MAIN MENU</p>

        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                activeSection === item.id
                  ? "admin-nav-item active"
                  : "admin-nav-item"
              }
              onClick={() => setActiveSection(item.id)}
            >
              <span className="admin-nav-icon" aria-hidden="true">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="admin-sidebar-signout"
          onClick={handleSignOut}
        >
          <span aria-hidden="true">↪</span>
          Sign Out
        </button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-topbar-eyebrow">
              REAL ESTATE MANAGEMENT
            </p>
            <h1>{activeLabel}</h1>
          </div>

          <div className="admin-topbar-user">
            <span className="admin-online-indicator" />
            Admin Workspace
          </div>
        </header>

        {activeSection === "dashboard" && (
          <section className="admin-overview">
            <div className="admin-welcome-panel">
              <div>
                <p>ADMINISTRATOR WORKSPACE</p>
                <h2>Welcome back, {displayName}</h2>
                <span>
                  Monitor users, review applications, and oversee your
                  real estate platform.
                </span>
              </div>

              <div
                className="admin-welcome-illustration"
                aria-hidden="true"
              >
                🏢
              </div>
            </div>

            <div className="admin-section-title">
              <div>
                <h2>Platform Management</h2>
                <p>Select a section to manage RealEstateAI.</p>
              </div>
            </div>

            <div className="admin-management-grid">
              {NAV_ITEMS.filter(
                (item) => item.id !== "dashboard"
              ).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="admin-management-card"
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="admin-management-icon">
                    {item.icon}
                  </span>

                  <h3>{item.label}</h3>

                  <span className="admin-management-link">
                    Open section →
                  </span>
                </button>
              ))}
            </div>

            <div className="admin-overview-note">
              <strong>Administrator access</strong>
              <p>
                Review agent applications, manage customers and registered
                agents, and access property and inquiry management.
              </p>
            </div>
          </section>
        )}

        {activeSection === "applications" && (
          <div className="admin-embedded-page">
            <AdminApplications />
          </div>
        )}

        {activeSection === "customers" && (
          <div className="admin-embedded-page">
            <AdminCustomers />
          </div>
        )}

        {activeSection === "agents" && (
          <div className="admin-embedded-page">
            <AdminAgents />
          </div>
        )}

        {activeSection === "properties" && (
          <section className="admin-coming-soon">
            {activeSection === "properties" && (
  <div className="admin-embedded-page">
    <AdminProperties />
  </div>
)}

            <button
              type="button"
              className="admin-return-button"
              onClick={() => setActiveSection("dashboard")}
            >
              Back to Dashboard
            </button>
          </section>
        )}

        {activeSection === "inquiries" && (
          <section className="admin-coming-soon">
             <div className="admin-embedded-page">
    <AdminInquiries />
  </div>

            <button
              type="button"
              className="admin-return-button"
              onClick={() => setActiveSection("dashboard")}
            >
              Back to Dashboard
            </button>
          </section>
        )}
      </section>
    </main>
  );
}
