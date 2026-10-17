
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import agentApplicationService from "../../api/services/agentApplicationService";
import "./BecomeAgent.css";

export default function BecomeAgent() {
  const [reason, setReason] = useState("");
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadApplication = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await agentApplicationService.getMyApplicationStatus();

      setApplication(data ?? null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your application status."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!reason.trim()) {
      setError("Please enter a reason for becoming an agent.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const result =
        await agentApplicationService.applyForAgent(reason.trim());

      setApplication(result);
      setReason("");
      setSuccess("Your agent application has been submitted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit your application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const status = String(application?.status ?? "").toUpperCase();

  return (
    <main className="become-agent-page">
      <header className="become-agent-header">
        <div>
          <Link to="/customer/search" className="become-agent-brand">
            RealEstateAI
          </Link>
          <h1>Become a Real Estate Agent</h1>
          <p>Submit your request and let our admin team review it.</p>
        </div>

        <nav className="become-agent-nav">
          <Link to="/customer/search">Search Properties</Link>
          <Link to="/customer/favorites">My Favorites</Link>
          <Link to="/customer/inquiries">My Inquiries</Link>
          <Link to="/customer/profile">My Profile</Link>
        </nav>
      </header>

      <section className="become-agent-card">
        {loading ? (
          <p role="status">Checking your application...</p>
        ) : (
          <>
            {error && (
              <div className="become-agent-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="become-agent-success" role="status">
                {success}
              </div>
            )}

            {application && status !== "REJECTED" ? (
              <div className="become-agent-status">
                <h2>Your Application</h2>

                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`agent-status-badge ${status.toLowerCase()}`}>
                    {status}
                  </span>
                </p>

                <p>
                  <strong>Reason:</strong>{" "}
                  {application.reason || "Not provided"}
                </p>

                {application.appliedAt && (
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {new Date(application.appliedAt).toLocaleString("en-IN")}
                  </p>
                )}

                {application.reviewedAt && (
                  <p>
                    <strong>Reviewed:</strong>{" "}
                    {new Date(application.reviewedAt).toLocaleString("en-IN")}
                  </p>
                )}

                {application.adminComment && (
                  <p>
                    <strong>Admin comment:</strong>{" "}
                    {application.adminComment}
                  </p>
                )}

                {status === "PENDING" && (
                  <p className="become-agent-note">
                    Your application is waiting for admin approval.
                  </p>
                )}

                {status === "APPROVED" && (
                  <p className="become-agent-note">
                    Your application has been approved. You can now access
                    agent features after signing in with your updated role.
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2>Apply Now</h2>

                {status === "REJECTED" && (
                  <div className="become-agent-rejected">
                    <p>
                      Your previous application was rejected. You may submit
                      a new application.
                    </p>

                    {application.adminComment && (
                      <p>
                        <strong>Admin comment:</strong>{" "}
                        {application.adminComment}
                      </p>
                    )}
                  </div>
                )}

                <label htmlFor="agent-reason">
                  Why do you want to become an agent?
                </label>

                <textarea
                  id="agent-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Explain your experience and why you want to become a real estate agent..."
                  rows={6}
                  maxLength={1000}
                  required
                />

                <p className="become-agent-character-count">
                  {reason.length}/1000 characters
                </p>

                <button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            )}
          </>
        )}
      </section>
    </main>
  );
}
