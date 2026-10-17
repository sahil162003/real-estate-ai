
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import propertyService from "../../api/services/propertyService";
import "./AgentProperties.css";

export default function AgentProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await propertyService.getMyProperties();

      const propertyList = Array.isArray(response)
        ? response
        : Array.isArray(response?.content)
          ? response.content
          : Array.isArray(response?.data)
            ? response.data
            : [];

      setProperties(propertyList);
    } catch (err) {
      console.error("Failed to load properties:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load properties. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    const previousProperty = properties.find(
      (property) => property.id === propertyId
    );

    if (!previousProperty || previousProperty.status === newStatus) {
      return;
    }

    try {
      setUpdatingId(propertyId);
      setError("");

      await api.patch(
        `/api/properties/updateStatus/${propertyId}`,
        null,
        {
          params: { status: newStatus },
        }
      );

      setProperties((previous) =>
        previous.map((property) =>
          property.id === propertyId
            ? { ...property, status: newStatus }
            : property
        )
      );
    } catch (err) {
      console.error("Failed to update property status:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update property status. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProperty = async (property) => {
    const propertyId = property.id;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${property.title || "Untitled Property"}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(propertyId);
      setError("");

      await api.delete("/api/properties/deleteProperties", {
        params: { id: propertyId },
      });

      setProperties((previous) =>
        previous.filter((item) => item.id !== propertyId)
      );
    } catch (err) {
      console.error("Failed to delete property:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete property. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price) => {
    if (price == null || price === "") {
      return "Not specified";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  return (
    <div className="agent-properties-page">
      <header className="agent-properties-header">
        <div>
          <h1>My Properties</h1>
          <p>View and manage your property listings.</p>
        </div>

        <div className="agent-properties-actions">
          <Link to="/agent/dashboard" className="agent-properties-back">
            Dashboard
          </Link>

          <Link to="/agent/properties/new" className="agent-properties-add">
            + Add Property
          </Link>
        </div>
      </header>

      <section className="agent-properties-summary">
        <div className="agent-properties-summary-card">
          <span>Total Properties</span>
          <strong>{properties.length}</strong>
        </div>
      </section>

      <section className="agent-properties-content">
        {error && (
          <div className="agent-properties-error" role="alert">
            <p>{error}</p>
            {!loading && (
              <button type="button" onClick={loadProperties}>
                Reload Properties
              </button>
            )}
          </div>
        )}

        {loading && (
          <p className="agent-properties-message">
            Loading properties...
          </p>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="agent-properties-empty">
            <h2>No properties found</h2>
            <p>
              You have not listed any properties yet. Add your first
              property to get started.
            </p>

            <Link
              to="/agent/properties/new"
              className="agent-properties-add"
            >
              Add Your First Property
            </Link>
          </div>
        )}

        {!loading && properties.length > 0 && (
          <div className="agent-properties-table-wrapper">
            <table className="agent-properties-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Bedrooms</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {properties.map((property) => (
                  <tr key={property.id}>
                    <td>
                      <strong>
                        {property.title || "Untitled Property"}
                      </strong>
                    </td>

                    <td>{property.location || "Not specified"}</td>

                    <td>{formatPrice(property.price)}</td>

                    <td>{property.bedrooms ?? "—"}</td>

                    <td>
                      <select
                        className="agent-properties-status-select"
                        value={property.status || "AVAILABLE"}
                        disabled={
                          updatingId === property.id ||
                          deletingId === property.id
                        }
                        aria-label={`Status for ${property.title || "property"}`}
                        onChange={(event) =>
                          handleStatusChange(
                            property.id,
                            event.target.value
                          )
                        }
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="SOLD">Sold</option>
                        <option value="RENTED">Rented</option>
                      </select>

                      {updatingId === property.id && (
                        <span className="agent-properties-updating">
                          Saving...
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="agent-properties-row-actions">
                        <Link
                          to={`/customer/properties/${property.id}`}
                          state={{ from: "agent" }}
                          className="agent-properties-view"
                        >
                          View
                        </Link>

                        <Link
                          to={`/agent/properties/edit/${property.id}`}
                          className="agent-properties-edit"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          className="agent-properties-delete"
                          disabled={
                            deletingId === property.id ||
                            updatingId === property.id
                          }
                          onClick={() => handleDeleteProperty(property)}
                        >
                          {deletingId === property.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
