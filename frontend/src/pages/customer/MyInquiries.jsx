
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import inquiryService from "../../api/services/inquiryService";
import "./MyInquiries.css";

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

const getInquiryId = (inquiry) =>
  inquiry.inquiryId ?? inquiry.id;

const getPropertyId = (inquiry) =>
  inquiry.propertyId ??
  inquiry.property?.id ??
  inquiry.property?.propertyId;

const getInquiryMessage = (inquiry) =>
  inquiry.connect ??
  inquiry.message ??
  inquiry.inquiryMessage ??
  inquiry.description ??
  "No message available.";

const getInquiryDate = (inquiry) =>
  inquiry.createdAt ??
  inquiry.createdDate ??
  inquiry.inquiryDate ??
  inquiry.date;

const getPropertyTitle = (inquiry) =>
  inquiry.propertyTitle ??
  inquiry.property?.title ??
  (getPropertyId(inquiry) != null
    ? `Property #${getPropertyId(inquiry)}`
    : "Property inquiry");

export default function MyInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await inquiryService.getMyInquiries();

      const items = Array.isArray(data)
        ? data
        : data?.content ?? data?.inquiries ?? [];

      setInquiries(items);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your inquiries. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return (
    <main className="my-inquiries-page">
      <header className="my-inquiries-header">
        <div>
          <Link
            to="/customer/search"
            className="my-inquiries-brand"
          >
            RealEstateAI
          </Link>

          <h1>My Inquiries</h1>
          <p>
            View the property inquiries you have submitted.
          </p>
        </div>

        <nav className="my-inquiries-nav">
          <Link to="/customer/search">Search Properties</Link>
          <Link to="/customer/favorites">My Favorites</Link>
            <Link to="/customer/inquiries">My Inquiries</Link>

          <Link to="/customer/profile">My Profile</Link>
        </nav>
      </header>

      <section className="my-inquiries-content">
        <div className="my-inquiries-heading">
          <h2>Submitted Inquiries</h2>

          {!loading && !error && (
            <span>{inquiries.length} inquiries</span>
          )}
        </div>

        {loading && (
          <p className="my-inquiries-message" role="status">
            Loading your inquiries...
          </p>
        )}

        {error && (
          <div className="my-inquiries-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={fetchInquiries}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && inquiries.length === 0 && (
          <div className="my-inquiries-empty">
            <div className="my-inquiries-empty-icon" aria-hidden="true">
              ✉
            </div>

            <h3>No inquiries yet</h3>

            <p>
              When you contact us about a property, your inquiry
              will appear here.
            </p>

            <Link
              to="/customer/search"
              className="my-inquiries-browse-button"
            >
              Explore Properties
            </Link>
          </div>
        )}

        {!loading && !error && inquiries.length > 0 && (
          <div className="my-inquiries-list">
            {inquiries.map((inquiry, index) => {
              const inquiryId = getInquiryId(inquiry);
              const propertyId = getPropertyId(inquiry);
              const status = inquiry.status;

              return (
                <article
                  className="my-inquiry-card"
                  key={inquiryId ?? `${propertyId ?? "inquiry"}-${index}`}
                >
                  <div className="my-inquiry-card-header">
                    <div>
                      <p className="my-inquiry-label">
                        INQUIRY {inquiryId != null ? `#${inquiryId}` : ""}
                      </p>

                      <h3>{getPropertyTitle(inquiry)}</h3>
                    </div>

                    {status && (
                      <span className="my-inquiry-status">
                        {String(status).replaceAll("_", " ")}
                      </span>
                    )}
                  </div>

                  <div className="my-inquiry-message">
                    <h4>Your message</h4>
                    <p>{getInquiryMessage(inquiry)}</p>
                  </div>

                  <div className="my-inquiry-card-footer">
                    <span>
                      Submitted: {formatDate(getInquiryDate(inquiry))}
                    </span>

                    {propertyId != null && (
                      <Link
                        to={`/customer/properties/${propertyId}`}
                        className="my-inquiry-view-link"
                      >
                        View Property →
                      </Link>
                    )}

                    {inquiryId != null && (
                      <Link
                        to={`/customer/inquiries/${inquiryId}`}
                        className="my-inquiry-view-link"
                      >
                        View Inquiry →
                      </Link>
                    )}
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
