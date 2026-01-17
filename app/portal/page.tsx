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

export default function PortalPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const res = await fetch("/api/tickets");
        if (!res.ok) throw new Error("Failed to load tickets");

        const data = await res.json();
        setTickets(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTickets();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "#2196f3";
      case "in_progress":
        return "#ff9800";
      case "resolved":
        return "#4caf50";
      case "closed":
        return "#999";
      default:
        return "#667eea";
    }
  };

  return (
    <div>
      <section className="card">
        <p className="eyebrow">Customer Portal</p>
        <h2>Your Tickets</h2>
        <p>Track your support requests, escalations, and conversations with our team.</p>
      </section>

      {error && (
        <div className="card" style={{ backgroundColor: "#ffebee", borderColor: "#ef5350" }}>
          <p style={{ color: "#d32f2f" }}>Error: {error}</p>
        </div>
      )}

      <section className="card">
        <h3>All Tickets ({tickets.length})</h3>
        {isLoading ? (
          <p>Loading your tickets...</p>
        ) : tickets.length === 0 ? (
          <p style={{ color: "#666" }}>
            You don&apos;t have any tickets yet. Start a chat with our support team using the widget to escalate an issue.
          </p>
        ) : (
          <div className="list">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="card" style={{ marginBottom: "10px", borderLeft: `4px solid ${getStatusColor(ticket.status)}` }}>
                <div>
                  <h4 style={{ margin: "0 0 10px 0" }}>{ticket.subject}</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", fontSize: "14px" }}>
                    <div>
                      <p style={{ margin: "0 0 3px 0", color: "#666", fontSize: "12px" }}>TICKET ID</p>
                      <p style={{ margin: 0, fontWeight: "600", fontFamily: "monospace" }}>
                        {ticket.id.substring(0, 12)}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 3px 0", color: "#666", fontSize: "12px" }}>STATUS</p>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: "600",
                          color: "white",
                          backgroundColor: getStatusColor(ticket.status),
                          padding: "3px 8px",
                          borderRadius: "4px",
                          display: "inline-block"
                        }}
                      >
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 3px 0", color: "#666", fontSize: "12px" }}>CREATED</p>
                      <p style={{ margin: 0 }}>
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card" style={{ backgroundColor: "#f5f5f5" }}>
        <h3>Need Help?</h3>
        <p>
          Use the support widget (bottom right) to start a conversation with our team. You can escalate issues to create tickets
          that will be tracked here.
        </p>
      </section>
    </div>
  );
}
