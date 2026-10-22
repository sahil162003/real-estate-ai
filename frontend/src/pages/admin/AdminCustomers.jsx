
import { useCallback, useEffect, useMemo, useState } from "react";
import "./AdminCustomers.css";

const API_URL = "http://localhost:8081/api/admin/customers";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("authToken");

      const response = await fetch(API_URL, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Access denied. Please sign in with an Admin account."
          );
        }

        throw new Error(`Unable to load customers (${response.status}).`);
      }

      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) => {
      const name =
        `${customer.firstName || ""} ${customer.lastName || ""}`
          .trim()
          .toLowerCase();

      return (
        name.includes(query) ||
        (customer.email || "").toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString("en-IN");
  };

  return (
    <main className="admin-customers-page">
      <header className="admin-customers-header">
        <div>
          <p className="admin-customers-eyebrow">ADMINISTRATION</p>
          <h1>Manage Customers</h1>
          <p>View and search registered customers.</p>
        </div>

        <button
          type="button"
          className="admin-customers-refresh-button"
          onClick={fetchCustomers}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <section className="admin-customers-content">
        <div className="admin-customers-summary">
          <div>
            <span>Total Customers</span>
            <strong>{customers.length}</strong>
          </div>
          <div>
            <span>Search Results</span>
            <strong>{filteredCustomers.length}</strong>
          </div>
        </div>

        <div className="admin-customers-toolbar">
          <label
            className="admin-customers-search"
            htmlFor="customer-search"
          >
            Search by name or email
            <input
              id="customer-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Enter name or email..."
            />
          </label>
        </div>

        {error && (
          <div className="admin-customers-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={fetchCustomers}>
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <p className="admin-customers-feedback" role="status">
            Loading customers...
          </p>
        ) : !error && filteredCustomers.length === 0 ? (
          <div className="admin-customers-empty">
            <h2>
              {customers.length === 0
                ? "No customers found"
                : "No matching customers"}
            </h2>
            <p>
              {customers.length === 0
                ? "Registered customers will appear here."
                : "Try a different name or email."}
            </p>
          </div>
        ) : !error ? (
          <div className="admin-customers-table-wrapper">
            <table className="admin-customers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Registered</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>#{customer.id}</td>
                    <td className="admin-customer-name">
                      {[customer.firstName, customer.lastName]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </td>
                    <td>{customer.email || "—"}</td>
                    <td>{customer.phoneNumber || "—"}</td>
                    <td className="admin-customer-address">
                      {customer.address || "—"}
                    </td>
                    <td>{formatDate(customer.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}
