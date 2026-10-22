import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "./AgentDashboard.css";

const API_URL = "http://localhost:8081/api/agent";

export default function AgentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [inquiries, setInquiries] = useState([]);
  const [responses, setResponses] = useState({});
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [inquiriesLoaded, setInquiriesLoaded] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submittingId, setSubmittingId] = useState(null);

  const displayName =
    user?.firstName ||
    user?.name ||
    user?.email ||
    "Agent";

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken");

  const getAuthHeaders = () => {
    const token = getToken();

    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    };
  };

  // Fetch inquiries belonging to the authenticated agent.
  const fetchInquiries = useCallback(async () => {
    setLoadingInquiries(true);
    setInquiryError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}/inquiries`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "Your session may have expired. Please sign in again."
            : `Unable to load inquiries (${response.status}).`
        );
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];

      setInquiries(list);

      setResponses((previous) => {
        const next = { ...previous };

        list.forEach((inquiry) => {
          // Preserve unsaved typing while initializing saved responses.
          if (!(inquiry.id in next)) {
            next[inquiry.id] = inquiry.agentResponse || "";
          }
        });

        return next;
      });

      setInquiriesLoaded(true);
    } catch (error) {
      setInquiryError(
        error.message || "Unable to load customer inquiries."
      );
    } finally {
      setLoadingInquiries(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "inquiries" && !inquiriesLoaded) {
      fetchInquiries();
    }
  }, [activeSection, inquiriesLoaded, fetchInquiries]);

  const openInquiries = () => {
    setActiveSection("inquiries");
    setInquiryError("");
    setSuccessMessage("");
  };

  const openDashboard = () => {
    setActiveSection("dashboard");
    setInquiryError("");
    setSuccessMessage("");
  };

  // Update the response textarea.
  const handleResponseChange = (inquiryId, value) => {
    setResponses((previous) => ({
      ...previous,
      [inquiryId]: value,
    }));

    setSuccessMessage("");
    setInquiryError("");
  };

  // Send or update the agent's response.
  const handleSendResponse = async (inquiry) => {
    const inquiryId = inquiry.id;
    const responseText = (responses[inquiryId] || "").trim();

    if (!responseText) {
      setInquiryError("Please enter a response before submitting.");
      return;
    }

    if (responseText.length > 2000) {
      setInquiryError("Your response cannot exceed 2000 characters.");
      return;
    }

    setSubmittingId(inquiryId);
    setInquiryError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_URL}/inquiries/${inquiryId}/response`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ response: responseText }),
        }
      );

      if (!response.ok) {
        let message = `Unable to save response (${response.status}).`;

        try {
          const errorData = await response.json();
          message = errorData.message || errorData.error || message;
        } catch {
          // Keep the fallback error message.
        }

        throw new Error(message);
      }

      const updatedInquiry = await response.json();

      setInquiries((previous) =>
        previous.map((item) =>
          item.id === inquiryId ? updatedInquiry : item
        )
      );

      setResponses((previous) => ({
        ...previous,
        [inquiryId]: updatedInquiry.agentResponse || responseText,
      }));

      setSuccessMessage(
        `Response saved successfully for inquiry #${inquiryId}.`
      );
    } catch (error) {
      setInquiryError(
        error.message || "Unable to send your response."
      );
    } finally {
      setSubmittingId(null);
    }
  };

  // Close a CONTACTED inquiry.
  const handleCloseInquiry = async (inquiry) => {
    const inquiryId = inquiry.id;

    if (inquiry.status !== "CONTACTED") {
      setInquiryError("Only contacted inquiries can be closed.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to close inquiry #${inquiryId}?`
    );

    if (!confirmed) {
      return;
    }

    setSubmittingId(inquiryId);
    setInquiryError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_URL}/inquiries/${inquiryId}/status?status=CLOSED`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        let message = `Unable to close inquiry (${response.status}).`;

        try {
          const errorData = await response.json();
          message = errorData.message || errorData.error || message;
        } catch {
          // Keep the fallback error message.
        }

        throw new Error(message);
      }

      const updatedInquiry = await response.json();

      // Update the inquiry immediately without refreshing the page.
      setInquiries((previous) =>
        previous.map((item) =>
          item.id === inquiryId ? updatedInquiry : item
        )
      );

      setSuccessMessage(
        `Inquiry #${inquiryId} has been closed successfully.`
      );
    } catch (error) {
      setInquiryError(
        error.message || "Unable to close this inquiry."
      );
    } finally {
      setSubmittingId(null);
    }
  };

  // Sign out the agent.
  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  // Format dates for display.
  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString();
  };

  return (
    <main className="agent-dashboard">
      {/* Dashboard header and navigation */}
      <header className="agent-dashboard-header">
        <div>
          <Link
            to="/agent/dashboard"
            className="agent-dashboard-brand"
            onClick={openDashboard}
          >
            RealEstateAI
          </Link>

          <p className="agent-dashboard-eyebrow">
            AGENT WORKSPACE
          </p>

          <h1>Welcome, {displayName}</h1>

          <p className="agent-dashboard-subtitle">
            Manage your property listings and customer inquiries from one place.
          </p>
        </div>

        <nav className="agent-dashboard-nav">
          <button
            type="button"
            className={
              activeSection === "dashboard" ? "active" : ""
            }
            onClick={openDashboard}
          >
            Dashboard
          </button>

          <Link to="/agent/properties">
            My Properties
          </Link>

          <Link to="/agent/properties/new">
            Add Property
          </Link>

          <button
            type="button"
            className={
              activeSection === "inquiries" ? "active" : ""
            }
            onClick={openInquiries}
          >
            Inquiries
          </button>

          <Link to="/customer/profile">
            My Profile
          </Link>

          <button
            type="button"
            className="agent-signout-button"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </nav>
      </header>

      {/* Main dashboard */}
      {activeSection === "dashboard" && (
        <>
          <section className="agent-dashboard-welcome">
            <div>
              <span className="agent-dashboard-label">
                YOUR AGENT ACCOUNT
              </span>

              <h2>Manage your real estate business</h2>

              <p>
                Create property listings, keep your information updated,
                and respond to customers interested in your properties.
              </p>

              <Link
                to="/agent/properties/new"
                className="agent-dashboard-primary-button"
              >
                + Add New Property
              </Link>
            </div>

            <div
              className="agent-dashboard-house-icon"
              aria-hidden="true"
            >
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
                <p>
                  Create a new property listing for customers to discover.
                </p>
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
                <p>
                  View and manage your existing property listings.
                </p>
                <span className="agent-dashboard-action-link">
                  View listings →
                </span>
              </Link>

              <button
                type="button"
                className="agent-dashboard-action-card agent-inquiries-action"
                onClick={openInquiries}
              >
                <span className="agent-dashboard-action-icon">✉</span>
                <h3>Customer Inquiries</h3>
                <p>
                  Read customer messages and respond to inquiries
                  about your properties.
                </p>
                <span className="agent-dashboard-action-link">
                  Manage inquiries →
                </span>
              </button>

              <Link
                to="/customer/profile"
                className="agent-dashboard-action-card"
              >
                <span className="agent-dashboard-action-icon">♙</span>
                <h3>My Profile</h3>
                <p>
                  View or update your account information.
                </p>
                <span className="agent-dashboard-action-link">
                  View profile →
                </span>
              </Link>
            </div>
          </section>
        </>
      )}

      {/* Customer inquiries */}
      {activeSection === "inquiries" && (
        <section className="agent-dashboard-section agent-inquiries-section">
          <div className="agent-dashboard-section-heading">
            <div>
              <span className="agent-dashboard-label">
                CUSTOMER COMMUNICATION
              </span>

              <h2>Customer Inquiries</h2>

              <p>
                View messages and send responses to customers interested
                in your properties.
              </p>
            </div>

            <button
              type="button"
              className="agent-inquiries-refresh"
              onClick={fetchInquiries}
              disabled={loadingInquiries}
            >
              {loadingInquiries ? "Loading..." : "Refresh"}
            </button>
          </div>

          {inquiryError && (
            <div className="agent-inquiries-error" role="alert">
              {inquiryError}
            </div>
          )}

          {successMessage && (
            <div className="agent-inquiries-success" role="status">
              {successMessage}
            </div>
          )}

          {loadingInquiries ? (
            <p className="agent-inquiries-message">
              Loading customer inquiries...
            </p>
          ) : inquiries.length === 0 ? (
            <div className="agent-inquiries-empty">
              <h3>No customer inquiries yet</h3>
              <p>
                New inquiries about your properties will appear here.
              </p>
            </div>
          ) : (
            <div className="agent-inquiries-list">
              {inquiries.map((inquiry) => {
                const isClosed = inquiry.status === "CLOSED";
                const currentResponse = responses[inquiry.id] || "";

                return (
                  <article
                    className="agent-inquiry-card"
                    key={inquiry.id}
                  >
                    <div className="agent-inquiry-card-header">
                      <div>
                        <span className="agent-inquiry-number">
                          Inquiry #{inquiry.id}
                        </span>

                        <h3>
                          {inquiry.customerName || "Customer"}
                        </h3>

                        {inquiry.customerEmail ? (
                          <a href={`mailto:${inquiry.customerEmail}`}>
                            {inquiry.customerEmail}
                          </a>
                        ) : (
                          <span>Email unavailable</span>
                        )}
                      </div>

                      <span
                        className={`agent-inquiry-status agent-inquiry-status-${(
                          inquiry.status || "PENDING"
                        ).toLowerCase()}`}
                      >
                        {inquiry.status || "PENDING"}
                      </span>
                    </div>

                    <div className="agent-inquiry-meta">
                      <span>
                        Property ID: {inquiry.propertyId}
                      </span>

                      <span>
                        Received: {formatDate(inquiry.createdAt)}
                      </span>

                      {inquiry.contactedAt && (
                        <span>
                          Contacted: {formatDate(inquiry.contactedAt)}
                        </span>
                      )}

                      {inquiry.closedAt && (
                        <span>
                          Closed: {formatDate(inquiry.closedAt)}
                        </span>
                      )}
                    </div>

                    <div className="agent-inquiry-message">
                      <h4>Customer message</h4>
                      <p>{inquiry.message}</p>
                    </div>

                    {inquiry.agentResponse && (
                      <div className="agent-inquiry-saved-response">
                        <h4>Saved agent response</h4>
                        <p>{inquiry.agentResponse}</p>
                      </div>
                    )}

                    <div className="agent-inquiry-response-form">
                      <label htmlFor={`response-${inquiry.id}`}>
                        Your response
                      </label>

                      <textarea
                        id={`response-${inquiry.id}`}
                        value={currentResponse}
                        onChange={(event) =>
                          handleResponseChange(
                            inquiry.id,
                            event.target.value
                          )
                        }
                        placeholder="Write a helpful response to the customer..."
                        rows={4}
                        maxLength={2000}
                        disabled={
                          isClosed || submittingId === inquiry.id
                        }
                      />

                      <div className="agent-inquiry-response-footer">
                        <span>
                          {currentResponse.length}/2000 characters
                        </span>

                        <button
                          type="button"
                          className="agent-inquiry-send-button"
                          onClick={() => handleSendResponse(inquiry)}
                          disabled={
                            isClosed ||
                            submittingId === inquiry.id ||
                            !currentResponse.trim()
                          }
                        >
                          {submittingId === inquiry.id
                            ? "Saving..."
                            : inquiry.agentResponse
                              ? "Update Response"
                              : "Send Response"}
                        </button>
                      </div>

                      {/* Close button for CONTACTED inquiries */}
                      {isClosed ? (
                        <p className="agent-inquiry-closed-note">
                          This inquiry is closed and cannot receive
                          further responses.
                        </p>
                      ) : (
                        inquiry.status === "CONTACTED" && (
                          <button
                            type="button"
                            className="agent-inquiry-close-button"
                            onClick={() => handleCloseInquiry(inquiry)}
                            disabled={submittingId === inquiry.id}
                          >
                            {submittingId === inquiry.id
                              ? "Processing..."
                              : "Close Inquiry"}
                          </button>
                        )
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}