
import { useCallback, useEffect, useState } from "react";
import "./AdminAgents.css";

const API_URL = "http://localhost:8081/api/admin/agents";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken")
  );
}

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAgents = useCallback(async () => {
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
            `Access denied (${response.status}). Please check your login token and ADMIN permissions.`
          );
        }

        throw new Error(`Failed to load agents (${response.status}).`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the server.");
      }

      setAgents(data);
    } catch (err) {
      setError(
        err.message || "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const filteredAgents = agents.filter((agent) => {
    const fullName =
      `${agent.firstName || ""} ${agent.lastName || ""}`.trim();

    const query = search.toLowerCase();

    return (
      fullName.toLowerCase().includes(query) ||
      (agent.email || "").toLowerCase().includes(query) ||
      (agent.phoneNumber || "").toLowerCase().includes(query)
    );
  });

  return (
    <section className="admin-agents-page">
      <div className="admin-agents-header">
        <div>
          <h2>Manage Agents</h2>
          <p>View registered agents on RealEstateAI.</p>
        </div>

        <button
          type="button"
          className="admin-agents-refresh"
          onClick={fetchAgents}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="admin-agents-summary">
        <span>Total Registered Agents</span>
        <strong>{agents.length}</strong>
      </div>

      <input
        className="admin-agents-search"
        type="search"
        placeholder="Search by name, email, or phone..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {loading && (
        <p className="admin-agents-message">Loading agents...</p>
      )}

      {!loading && error && (
        <div className="admin-agents-error">
          <p>{error}</p>
          <button type="button" onClick={fetchAgents}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && filteredAgents.length === 0 && (
        <p className="admin-agents-message">
          {agents.length === 0
            ? "No registered agents found."
            : "No agents match your search."}
        </p>
      )}

      {!loading && !error && filteredAgents.length > 0 && (
        <div className="admin-agents-table-wrapper">
          <table className="admin-agents-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Agent Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Registered On</th>
              </tr>
            </thead>

            <tbody>
              {filteredAgents.map((agent) => (
                <tr key={agent.id}>
                  <td>{agent.id}</td>
                  <td>
                    {[agent.firstName, agent.lastName]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </td>
                  <td>{agent.email || "—"}</td>
                  <td>{agent.phoneNumber || "—"}</td>
                  <td>{agent.address || "—"}</td>
                  <td>
                    {agent.createdAt
                      ? new Date(agent.createdAt).toLocaleDateString()
                      : "—"}
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
