
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import propertyService from "../../api/services/propertyService";
import inquiryService from "../../api/services/inquiryService";
import "./PropertyDetails.css";

function formatPrice(price) {
  if (price == null) return "Price not available";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PropertyDetails() {
  const { id } = useParams();
  const location = useLocation();

  const isAgentView = location.state?.from === "agent";
  const backPath = isAgentView ? "/agent/properties" : "/customer/search";
  const backLabel = isAgentView
    ? "← Back to My Properties"
    : "← Back to Property Search";

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState("");
  const [inquiryError, setInquiryError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await propertyService.getPropertyById(id);

        if (active) {
          setProperty(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load property details. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProperty();

    return () => {
      active = false;
    };
  }, [id]);

  const handleInquirySubmit = async (event) => {
    event.preventDefault();

    const message = inquiryMessage.trim();

    if (!message) {
      setInquiryError("Please enter your inquiry message.");
      return;
    }

    try {
      setInquiryLoading(true);
      setInquiryError("");
      setInquirySuccess("");

      await inquiryService.sendInquiry(property.id, message);

      setInquirySuccess(
        "Your inquiry has been submitted successfully."
      );
      setInquiryMessage("");
    } catch (err) {
      setInquiryError(
        err.response?.data?.message ||
          "Unable to submit your inquiry. Please try again."
      );
    } finally {
      setInquiryLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="property-details-page">
        <p className="property-details-message">
          Loading property details...
        </p>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="property-details-page">
        <p className="property-details-error" role="alert">
          {error || "Property not found."}
        </p>

        <Link to={backPath} className="property-back-link">
          {backLabel}
        </Link>
      </main>
    );
  }

  return (
    <main className="property-details-page">
      <Link to={backPath} className="property-back-link">
        {backLabel}
      </Link>

      <section className="property-details-card">
        <div className="property-details-header">
          <div>
            <p className="property-details-eyebrow">
              PROPERTY DETAILS
            </p>

            <h1>{property.title || "Untitled Property"}</h1>

            <p className="property-details-location">
              <span aria-hidden="true">📍 </span>
              {property.location || "Location not available"}
            </p>
          </div>

          {property.status && (
            <span className="property-details-status">
              {String(property.status).replaceAll("_", " ")}
            </span>
          )}
        </div>

        <div className="property-details-price">
          {formatPrice(property.price)}
        </div>

        <div className="property-details-features">
          <div className="property-feature">
            <span className="property-feature-icon" aria-hidden="true">
              🛏
            </span>
            <strong>{property.bedrooms ?? "—"}</strong>
            <span>Bedrooms</span>
          </div>

          <div className="property-feature">
            <span className="property-feature-icon" aria-hidden="true">
              🛁
            </span>
            <strong>{property.bathrooms ?? "—"}</strong>
            <span>Bathrooms</span>
          </div>

          <div className="property-feature">
            <span className="property-feature-icon" aria-hidden="true">
              ↔
            </span>
            <strong>
              {property.area != null
                ? `${property.area} sq. ft.`
                : "—"}
            </strong>
            <span>Area</span>
          </div>

          <div className="property-feature">
            <span className="property-feature-icon" aria-hidden="true">
              🏠
            </span>
            <strong>
              {property.propertyType
                ? String(property.propertyType).replaceAll("_", " ")
                : "—"}
            </strong>
            <span>Property Type</span>
          </div>
        </div>

        <div className="property-details-description">
          <h2>About This Property</h2>
          <p>
            {property.description ||
              "No description is available for this property yet."}
          </p>
        </div>

        {!isAgentView && (
          <section className="property-inquiry-section">
            <h2>Interested in This Property?</h2>
            <p>
              Send an inquiry to learn more about this property.
            </p>

            <form onSubmit={handleInquirySubmit}>
              <label htmlFor="inquiryMessage">Your message</label>

              <textarea
                id="inquiryMessage"
                name="inquiryMessage"
                rows={5}
                maxLength={1000}
                placeholder="I am interested in this property. Please share more details."
                value={inquiryMessage}
                onChange={(event) =>
                  setInquiryMessage(event.target.value)
                }
                disabled={inquiryLoading}
                required
              />

              <div className="property-inquiry-footer">
                <span>{inquiryMessage.length}/1000 characters</span>

                <button
                  type="submit"
                  disabled={inquiryLoading || !inquiryMessage.trim()}
                >
                  {inquiryLoading ? "Sending..." : "Send Inquiry"}
                </button>
              </div>

              {inquirySuccess && (
                <p className="property-inquiry-success" role="status">
                  {inquirySuccess}
                </p>
              )}

              {inquiryError && (
                <p className="property-inquiry-error" role="alert">
                  {inquiryError}
                </p>
              )}
            </form>
          </section>
        )}

        {property.createdAt && (
          <p className="property-details-date">
            Listed on:{" "}
            {new Date(property.createdAt).toLocaleDateString("en-IN")}
          </p>
        )}
      </section>
    </main>
  );
}
