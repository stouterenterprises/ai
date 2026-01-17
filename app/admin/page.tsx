"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export default function AdminPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newBusinessName, setNewBusinessName] = useState("");
  const [newBusinessDesc, setNewBusinessDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const res = await fetch("/api/businesses");
      if (!res.ok) throw new Error("Failed to load businesses");
      const data = await res.json();
      setBusinesses(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusinessName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBusinessName,
          description: newBusinessDesc || null
        })
      });

      if (!res.ok) throw new Error("Failed to create business");

      setNewBusinessName("");
      setNewBusinessDesc("");
      await loadBusinesses();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBusiness = async (id: string) => {
    if (!confirm("Are you sure you want to delete this business?")) return;

    try {
      const res = await fetch(`/api/businesses/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete business");
      await loadBusinesses();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <section className="card">
        <p className="eyebrow">Admin Console</p>
        <h2>Businesses</h2>
        <p>Manage your businesses and departments. Each business can have multiple departments with their own AI bots and knowledge bases.</p>
      </section>

      {error && (
        <div className="card" style={{ backgroundColor: "#ffebee", borderColor: "#ef5350" }}>
          <p style={{ color: "#d32f2f" }}>Error: {error}</p>
        </div>
      )}

      <section className="card">
        <h3>Create New Business</h3>
        <form onSubmit={handleCreateBusiness}>
          <label>
            Business Name *
            <input
              type="text"
              value={newBusinessName}
              onChange={(e) => setNewBusinessName(e.target.value)}
              placeholder="e.g., Acme Inc."
              disabled={isCreating}
            />
          </label>
          <label>
            Description
            <textarea
              value={newBusinessDesc}
              onChange={(e) => setNewBusinessDesc(e.target.value)}
              placeholder="Optional description"
              rows={3}
              disabled={isCreating}
            />
          </label>
          <button type="submit" disabled={isCreating || !newBusinessName.trim()}>
            {isCreating ? "Creating..." : "Create Business"}
          </button>
        </form>
      </section>

      <section className="card">
        <h3>Your Businesses</h3>
        {isLoading ? (
          <p>Loading businesses...</p>
        ) : businesses.length === 0 ? (
          <p style={{ color: "#666" }}>No businesses yet. Create one above!</p>
        ) : (
          <div className="list">
            {businesses.map((business) => (
              <div key={business.id} className="card" style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 5px 0" }}>
                      <Link href={`/admin/${business.id}`} style={{ color: "#667eea" }}>
                        {business.name}
                      </Link>
                    </h4>
                    {business.description && (
                      <p style={{ margin: "5px 0", color: "#666", fontSize: "14px" }}>
                        {business.description}
                      </p>
                    )}
                    <p style={{ margin: "5px 0", color: "#999", fontSize: "12px" }}>
                      Created {new Date(business.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Link
                      href={`/admin/${business.id}`}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#667eea",
                        color: "white",
                        borderRadius: "4px",
                        textDecoration: "none",
                        fontSize: "12px"
                      }}
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => handleDeleteBusiness(business.id)}
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
