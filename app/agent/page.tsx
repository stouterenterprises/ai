"use client";

import { useEffect, useState } from "react";

interface Ticket {
  id: string;
  business_id: string;
  department_id: string;
  subject: string;
  status: string;
  created_at: string;
}

export default function AgentPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("open");

  useEffect(() => {
    loadTickets();
  }, [filterStatus]);

  const loadTickets = async () => {
    try {
      const url = new URL("/api/tickets", window.location.origin);
      if (filterStatus) {
        url.searchParams.set("status", filterStatus);
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load tickets");

      const data = await res.json();
      setTickets(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error("Failed to update ticket");
      await loadTickets();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete ticket");
      await loadTickets();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <section className="card">
        <p className="eyebrow">Agent Inbox</p>
        <h2>Tickets & Conversations</h2>
        <p>Manage customer tickets and escalated conversations.</p>
      </section>

      {error && (
        <div className="card" style={{ backgroundColor: "#ffebee", borderColor: "#ef5350" }}>
          <p style={{ color: "#d32f2f" }}>Error: {error}</p>
        </div>
      )}

      <section className="card">
        <h3>Filter by Status</h3>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {["open", "in_progress", "resolved", "closed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: "8px 15px",
                backgroundColor: filterStatus === status ? "#667eea" : "#f0f0f0",
                color: filterStatus === status ? "white" : "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: filterStatus === status ? "600" : "400"
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Tickets ({tickets.length})</h3>
        {isLoading ? (
          <p>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p style={{ color: "#666" }}>No tickets with status "{filterStatus}"</p>
        ) : (
          <div className="list">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="card" style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 5px 0" }}>{ticket.subject}</h4>
                    <div style={{ display: "flex", gap: "15px", fontSize: "12px", color: "#666" }}>
                      <span>ID: {ticket.id.substring(0, 8)}</span>
                      <span>Status: <strong>{ticket.status}</strong></span>
                      <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexDirection: "column", alignItems: "flex-end" }}>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      style={{
                        padding: "5px 10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "12px"
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#ef5350",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
