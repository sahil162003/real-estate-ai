
import { useCallback, useEffect, useState } from "react";
import "./AdminInquiries.css";

const API_URL = "http://localhost:8081/api/admin/inquiries";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken")
  );
}

function getCustomerName(inquiry) {
  return (
    inquiry.customerName ||
    inquiry.userName ||
    inquiry.customer?.firstName ||
    inquiry.user?.firstName ||
    "—"
  );
}

function getPropertyName(inquiry) {
  return (
    inquiry.propertyTitle ||
    inquiry.property?.title ||
    "—"
  );
}

function getAgentName(inquiry) {
  return (
    inquiry.agentName ||
    inquiry.agent?.firstName ||
    "—"
  );
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchInquiries = useCallback(async () => {
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
          `Failed to load inquiries (${response.status}).`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected inquiry data received from the server.");
      }

      setInquiries(data);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const statuses = [
    ...new Set(
      inquiries
        .map((inquiry) => inquiry.status)
        .filter(Boolean)
    ),
  ];

  const filteredInquiries = inquiries.filter((inquiry) => {
    const query = search.trim().toLowerCase();

    const matchesSearch = [
      String(inquiry.id ?? ""),
      getCustomerName(inquiry),
      getPropertyName(inquiry),
      getAgentName(inquiry),
      inquiry.email || "",
      inquiry.message || inquiry.content || "",
    ].some((value) => String(value).toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "ALL" ||
      inquiry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (inquiryId, status) => {
    const confirmed = window.confirm(
      `Change inquiry #${inquiryId} status to ${status}?`
    );

    if (!confirmed) return;

    setUpdatingId(inquiryId);
    setError("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/${inquiryId}/status?status=${encodeURIComponent(status)}`,
        {
          method: "PUT",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to update inquiry status (${response.status}).`
        );
      }

      await fetchInquiries();
    } catch (err) {
      setError(err.message || "Unable to update inquiry status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="admin-inquiries-page">
      <div className="admin-inquiries-header">
        <div>
          <h2>Manage Inquiries</h2>
          <p>Review customer inquiries and monitor their status.</p>
        </div>

        <button
          type="button"
          className="admin-inquiries-refresh"
          onClick={fetchInquiries}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="admin-inquiries-summary">
        <span>Total Inquiries</span>
        <strong>{inquiries.length}</strong>
      </div>

      <div className="admin-inquiries-filters">
        <input
          type="search"
          className="admin-inquiries-search"
          placeholder="Search customer, property, agent, or ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="admin-inquiries-status-filter"
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

      {error && (
        <div className="admin-inquiries-error">
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <p className="admin-inquiries-message">
          Loading inquiries...
        </p>
      )}

      {!loading && !error && filteredInquiries.length === 0 && (
        <p className="admin-inquiries-message">
          {inquiries.length === 0
            ? "No inquiries found."
            : "No inquiries match your search or status filter."}
        </p>
      )}

      {!loading && filteredInquiries.length > 0 && (
        <div className="admin-inquiries-table-wrapper">
          <table className="admin-inquiries-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Property</th>
                <th>Agent</th>
                <th>Message</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>{inquiry.id ?? "—"}</td>
                  <td>{getCustomerName(inquiry)}</td>
                  <td>{getPropertyName(inquiry)}</td>
                  <td>{getAgentName(inquiry)}</td>
                  <td className="admin-inquiries-message-cell">
                    {inquiry.message ||
                      inquiry.content ||
                      inquiry.description ||
                      "—"}
                  </td>
                  <td>
                    <span className="admin-inquiries-status">
                      {inquiry.status
                        ? inquiry.status.replaceAll("_", " ")
                        : "—"}
                    </span>
                  </td>
                  <td>
                    {inquiry.status &&
                    inquiry.status !== "CLOSED" ? (
                      <button
                        type="button"
                        className="admin-inquiries-close-button"
                        disabled={updatingId === inquiry.id}
                        onClick={() =>
                          updateStatus(inquiry.id, "CLOSED")
                        }
                      >
                        {updatingId === inquiry.id
                          ? "Updating..."
                          : "Close Inquiry"}
                      </button>
                    ) : (
                      <span className="admin-inquiries-closed-label">
                        {inquiry.status === "CLOSED"
                          ? "Closed"
                          : "Unavailable"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
