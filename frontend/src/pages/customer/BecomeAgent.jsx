
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import agentApplicationService from "../../api/services/agentApplicationService";
import userService from "../../api/services/userService";
import { isProfileComplete } from "../../utils/profileValidation";
import "./BecomeAgent.css";

export default function BecomeAgent() {
  const navigate = useNavigate();

  const [reason, setReason] = useState("");
  const [application, setApplication] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setCheckingProfile(true);
        setError("");

        const [profileResult, applicationResult] = await Promise.allSettled([
          userService.getMyProfile(),
          agentApplicationService.getMyApplicationStatus(),
        ]);

        if (!active) return;

        if (profileResult.status === "fulfilled") {
          setProfileComplete(
            isProfileComplete(profileResult.value)
          );
        } else {
          setProfileComplete(false);
          setError(
            "Unable to verify your profile. Please open My Profile and try again."
          );
        }

        if (applicationResult.status === "fulfilled") {
          setApplication(applicationResult.value ?? null);
        } else {
          setError((previous) =>
            previous ||
            applicationResult.reason?.response?.data?.message ||
            "Unable to load your application status."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
          setCheckingProfile(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!profileComplete) {
      setError(
        "Please complete your phone number and address before applying."
      );
      return;
    }

    if (!reason.trim()) {
      setError("Please enter a reason for becoming an agent.");
      return;
    }

    try {
      setSubmitting(true);

      const result =
        await agentApplicationService.applyForAgent(reason.trim());

      setApplication(result);
      setReason("");
      setSuccess(
        "Your agent application has been submitted successfully."
      );
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
        {loading || checkingProfile ? (
          <p role="status">Checking your profile and application...</p>
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

            {!profileComplete && (
              <div className="become-agent-error" role="alert">
                <h2>Complete Your Profile First</h2>
                <p>
                  Add a valid 10-digit Indian mobile number and your address
                  before applying to become an agent.
                </p>
                <Link to="/customer/profile">
                  Complete My Profile →
                </Link>
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
                    Your application has been approved. Sign in again if
                    needed to refresh your role and access agent features.
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

                <button
                  type="submit"
                  disabled={submitting || !profileComplete}
                >
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
