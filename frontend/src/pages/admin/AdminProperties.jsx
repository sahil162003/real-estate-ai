
import { useCallback, useEffect, useState } from "react";
import "./AdminProperties.css";

const API_URL =
  "http://localhost:8081/api/properties/getAllProperties";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken")
  );
}

function formatPrice(price) {
  if (price == null) return "—";

  return Number(price).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : parsedDate.toLocaleDateString("en-IN");
}

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      const response = await fetch(API_URL, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            `Access denied (${response.status}). Check your login token and admin permissions.`
          );
        }

        throw new Error(
          `Failed to load properties (${response.status}).`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected property data received.");
      }

      setProperties(data);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const statuses = [
    ...new Set(
      properties
        .map((property) => property.status)
        .filter(Boolean)
    ),
  ];

  const filteredProperties = properties.filter((property) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      (property.title || "").toLowerCase().includes(query) ||
      (property.location || "").toLowerCase().includes(query) ||
      String(property.propertyType || "")
        .toLowerCase()
        .includes(query);

    const matchesStatus =
      statusFilter === "ALL" ||
      property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="admin-properties-page">
      <div className="admin-properties-header">
        <div>
          <h2>Manage Properties</h2>
          <p>View and monitor properties listed on RealEstateAI.</p>
        </div>

        <button
          type="button"
          className="admin-properties-refresh"
          onClick={fetchProperties}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="admin-properties-summary">
        <span>Total Properties</span>
        <strong>{properties.length}</strong>
      </div>

      <div className="admin-properties-filters">
        <input
          type="search"
          className="admin-properties-search"
          placeholder="Search title, location, or property type..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="admin-properties-status-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All statuses</option>

          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="admin-properties-message">
          Loading properties...
        </p>
      )}

      {!loading && error && (
        <div className="admin-properties-error">
          <p>{error}</p>
          <button type="button" onClick={fetchProperties}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && filteredProperties.length === 0 && (
        <p className="admin-properties-message">
          {properties.length === 0
            ? "No properties found."
            : "No properties match your search or status filter."}
        </p>
      )}

      {!loading && !error && filteredProperties.length > 0 && (
        <div className="admin-properties-table-wrapper">
          <table className="admin-properties-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Property</th>
                <th>Location</th>
                <th>Type</th>
                <th>Price</th>
                <th>Bedrooms</th>
                <th>Bathrooms</th>
                <th>Area</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {filteredProperties.map((property) => (
                <tr key={property.id}>
                  <td>{property.id ?? "—"}</td>
                  <td>
                    <strong>{property.title || "Untitled"}</strong>
                  </td>
                  <td>{property.location || "—"}</td>
                  <td>
                    {property.propertyType
                      ? String(property.propertyType).replaceAll("_", " ")
                      : "—"}
                  </td>
                  <td>{formatPrice(property.price)}</td>
                  <td>{property.bedrooms ?? "—"}</td>
                  <td>{property.bathrooms ?? "—"}</td>
                  <td>
                    {property.area != null
                      ? `${property.area} sq. ft.`
                      : "—"}
                  </td>
                  <td>
                    <span className="admin-properties-status">
                      {property.status
                        ? String(property.status).replaceAll("_", " ")
                        : "—"}
                    </span>
                  </td>
                  <td>{formatDate(property.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
