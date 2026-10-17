
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import inquiryService from "../../api/services/inquiryService";
import "./InquiryDetails.css";

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function InquiryDetails() {
  const { inquiryId } = useParams();

  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await inquiryService.getInquiryById(inquiryId);
        setInquiry(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load inquiry details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [inquiryId]);

  const propertyId =
    inquiry?.propertyId ??
    inquiry?.property?.id ??
    inquiry?.property?.propertyId;

  const message =
    inquiry?.connect ??
    inquiry?.message ??
    inquiry?.inquiryMessage ??
    inquiry?.description ??
    "No message available.";

  const propertyTitle =
    inquiry?.propertyTitle ??
    inquiry?.property?.title ??
    (propertyId != null ? `Property #${propertyId}` : "Property inquiry");

  return (
    <main className="inquiry-details-page">
      <header className="inquiry-details-header">
        <Link to="/customer/inquiries">← Back to My Inquiries</Link>
        <h1>Inquiry Details</h1>
        <p>View the details of your submitted property inquiry.</p>
      </header>

      {loading && (
        <p role="status">Loading inquiry details...</p>
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
          <p className="inquiry-details-label">
            INQUIRY #{inquiry.inquiryId ?? inquiry.id ?? inquiryId}
          </p>

          <h2>{propertyTitle}</h2>

          {inquiry.status && (
            <p>
              <strong>Status:</strong>{" "}
              {String(inquiry.status).replaceAll("_", " ")}
            </p>
          )}

          <div className="inquiry-details-message">
            <h3>Your message</h3>
            <p>{message}</p>
          </div>

          <p>
            <strong>Submitted:</strong>{" "}
            {formatDate(
              inquiry.createdAt ??
              inquiry.createdDate ??
              inquiry.inquiryDate ??
              inquiry.date
            )}
          </p>

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
