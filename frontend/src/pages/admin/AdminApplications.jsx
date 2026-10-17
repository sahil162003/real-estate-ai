
import { useCallback, useEffect, useState } from "react";
import agentApplicationService from "../../api/services/agentApplicationService";
import "./AdminApplications.css";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await agentApplicationService.getPendingApplications();

      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load agent applications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDecision = async (applicationId, decision) => {
    const action = decision === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} application #${applicationId}?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(applicationId);
      setError("");
      setMessage("");

      if (decision === "approve") {
        await agentApplicationService.approveApplication(applicationId);
      } else {
        await agentApplicationService.rejectApplication(applicationId);
      }

      setApplications((current) =>
        current.filter(
          (application) =>
            (application.id ?? application.applicationId) !== applicationId
        )
      );

      setMessage(
        `Application #${applicationId} has been ${action}d successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Unable to ${action} this application. Please try again.`
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <main className="admin-applications-page">
      <header className="admin-applications-header">
        <div>
          <p className="admin-applications-eyebrow">ADMINISTRATION</p>
          <h1>Agent Applications</h1>
          <p>Review customer requests to become real estate agents.</p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={fetchApplications}
          disabled={loading || processingId !== null}
        >
          Refresh
        </button>
      </header>

      <section className="admin-applications-content">
        <div className="admin-applications-summary">
          <div>
            <span>Pending applications</span>
            <strong>{applications.length}</strong>
          </div>
        </div>

        {error && (
          <div className="admin-applications-error" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="admin-applications-success" role="status">
            {message}
          </div>
        )}

        {loading ? (
          <p className="admin-applications-feedback" role="status">
            Loading applications...
          </p>
        ) : applications.length === 0 && !error ? (
          <div className="admin-applications-empty">
            <h2>No pending applications</h2>
            <p>New customer applications will appear here.</p>
          </div>
        ) : (
          <div className="admin-applications-list">
            {applications.map((application) => {
              const applicationId =
                application.id ?? application.applicationId;

              return (
                <article
                  className="admin-application-card"
                  key={applicationId}
                >
                  <div className="admin-application-top">
                    <div>
                      <p className="admin-application-id">
                        APPLICATION #{applicationId}
                      </p>
                      <h2>
                        {application.userName || "Unknown applicant"}
                      </h2>
                      <p className="admin-application-email">
                        {application.email || "Email unavailable"}
                      </p>
                    </div>

                    <span className="admin-application-status">
                      {application.status || "PENDING"}
                    </span>
                  </div>

                  <div className="admin-application-reason">
                    <h3>Reason for applying</h3>
                    <p>{application.reason || "No reason provided."}</p>
                  </div>

                  <div className="admin-application-meta">
                    <span>
                      <strong>User ID:</strong>{" "}
                      {application.userId ?? "Unavailable"}
                    </span>

                    <span>
                      <strong>Applied:</strong>{" "}
                      {application.appliedAt
                        ? new Date(application.appliedAt).toLocaleString(
                            "en-IN"
                          )
                        : "Date unavailable"}
                    </span>
                  </div>

                  <div className="admin-application-actions">
                    <button
                      type="button"
                      className="admin-approve-button"
                      disabled={
                        processingId !== null ||
                        application.status !== "PENDING"
                      }
                      onClick={() =>
                        handleDecision(applicationId, "approve")
                      }
                    >
                      {processingId === applicationId
                        ? "Processing..."
                        : "Approve"}
                    </button>

                    <button
                      type="button"
                      className="admin-reject-button"
                      disabled={
                        processingId !== null ||
                        application.status !== "PENDING"
                      }
                      onClick={() =>
                        handleDecision(applicationId, "reject")
                      }
                    >
                      {processingId === applicationId
                        ? "Processing..."
                        : "Reject"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
