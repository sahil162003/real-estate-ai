
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import inquiryService from "../../api/services/inquiryService";
import "./InquiryDetails.css";

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatStatus = (status) => {
  if (!status) return "PENDING";

  return String(status)
    .replaceAll("_", " ")
    .toUpperCase();
};

export default function InquiryDetails() {
  const { inquiryId } = useParams();

  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchInquiry = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await inquiryService.getInquiryById(inquiryId);

        if (active) {
          setInquiry(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "Unable to load inquiry details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchInquiry();

    return () => {
      active = false;
    };
  }, [inquiryId]);

  const propertyId =
    inquiry?.propertyId ??
    inquiry?.property?.id ??
    inquiry?.property?.propertyId;

  const message =
    inquiry?.message ??
    inquiry?.connect ??
    inquiry?.inquiryMessage ??
    inquiry?.description ??
    "No message available.";

  const agentResponse =
    inquiry?.agentResponse ??
    inquiry?.response ??
    "";

  const propertyTitle =
    inquiry?.propertyTitle ??
    inquiry?.property?.title ??
    (propertyId != null
      ? `Property #${propertyId}`
      : "Property inquiry");

  const status = inquiry?.status ?? "PENDING";
  const isClosed = status === "CLOSED";

  return (
    <main className="inquiry-details-page">
      <header className="inquiry-details-header">
        <Link to="/customer/inquiries">
          ← Back to My Inquiries
        </Link>

        <h1>Inquiry Details</h1>

        <p>
          View your property inquiry and the response from the agent.
        </p>
      </header>

      {loading && (
        <p className="inquiry-details-message-state" role="status">
          Loading inquiry details...
        </p>
      )}

      {!loading && error && (
        <div className="inquiry-details-error" role="alert">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && inquiry && (
        <section className="inquiry-details-card">
          <div className="inquiry-details-card-header">
            <div>
              <p className="inquiry-details-label">
                INQUIRY #{inquiry.id ?? inquiry.inquiryId ?? inquiryId}
              </p>

              <h2>{propertyTitle}</h2>
            </div>

            <span
              className={`inquiry-details-status inquiry-status-${String(
                status
              ).toLowerCase()}`}
            >
              {formatStatus(status)}
            </span>
          </div>

          <div className="inquiry-details-timeline">
            <p>
              <strong>Submitted:</strong>{" "}
              {formatDate(
                inquiry.createdAt ??
                  inquiry.createdDate ??
                  inquiry.inquiryDate ??
                  inquiry.date
              )}
            </p>

            {inquiry.contactedAt && (
              <p>
                <strong>Contacted:</strong>{" "}
                {formatDate(inquiry.contactedAt)}
              </p>
            )}

            {inquiry.closedAt && (
              <p>
                <strong>Closed:</strong>{" "}
                {formatDate(inquiry.closedAt)}
              </p>
            )}
          </div>

          <div className="inquiry-details-message">
            <h3>Your message</h3>
            <p>{message}</p>
          </div>

          <section
            className={`inquiry-agent-response ${
              agentResponse
                ? "inquiry-agent-response-received"
                : "inquiry-agent-response-pending"
            }`}
            aria-live="polite"
          >
            <h3>Agent's Response</h3>

            {agentResponse ? (
              <>
                <p className="inquiry-agent-response-text">
                  {agentResponse}
                </p>

                <span className="inquiry-response-indicator">
                  Response received
                </span>
              </>
            ) : (
              <p className="inquiry-response-waiting">
                {isClosed
                  ? "This inquiry is closed. No agent response is available."
                  : "The agent has not responded yet. Please check again later."}
              </p>
            )}
          </section>

          {propertyId != null && (
            <Link
              to={`/customer/properties/${propertyId}`}
              className="inquiry-details-property-link"
            >
              View Property →
            </Link>
          )}
        </section>
      )}
    </main>
  );
}
