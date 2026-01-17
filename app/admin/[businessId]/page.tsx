"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Department {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Business {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export default function BusinessPage({ params }: { params: { businessId: string } }) {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");
  const [isCreatingDept, setIsCreatingDept] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [businessRes, deptRes] = await Promise.all([
          fetch(`/api/businesses/${params.businessId}`),
          fetch(`/api/departments/${params.businessId}`)
        ]);

        if (!businessRes.ok || !deptRes.ok) {
          throw new Error("Failed to load data");
        }

        const businessData = await businessRes.json();
        const deptData = await deptRes.json();

        setBusiness(businessData);
        setDepartments(deptData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.businessId]);

  const reloadData = async () => {
    try {
      const [businessRes, deptRes] = await Promise.all([
        fetch(`/api/businesses/${params.businessId}`),
        fetch(`/api/departments/${params.businessId}`)
      ]);

      if (!businessRes.ok || !deptRes.ok) {
        throw new Error("Failed to load data");
      }

      const businessData = await businessRes.json();
      const deptData = await deptRes.json();

      setBusiness(businessData);
      setDepartments(deptData);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    setIsCreatingDept(true);
    try {
      const res = await fetch(`/api/departments/${params.businessId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDeptName,
          description: newDeptDesc || null
        })
      });

      if (!res.ok) throw new Error("Failed to create department");

      setNewDeptName("");
      setNewDeptDesc("");
      await reloadData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsCreatingDept(false);
    }
  };

  const handleDeleteDepartment = async (deptId: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      const res = await fetch(
        `/api/departments/${params.businessId}/${deptId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to delete department");
      await reloadData();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (isLoading) {
    return <div><section className="card"><p>Loading...</p></section></div>;
  }

  if (!business) {
    return (
      <div>
        <section className="card">
          <p>Business not found</p>
          <Link href="/admin">Back to Businesses</Link>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="card">
        <Link href="/admin" style={{ color: "#667eea" }}>← Back to Businesses</Link>
        <p className="eyebrow">Business Details</p>
        <h2>{business.name}</h2>
        {business.description && <p>{business.description}</p>}
      </section>

      {error && (
        <div className="card" style={{ backgroundColor: "#ffebee", borderColor: "#ef5350" }}>
          <p style={{ color: "#d32f2f" }}>Error: {error}</p>
        </div>
      )}

      <section className="card">
        <h3>Create New Department</h3>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
          Departments organize your support team. Each can have its own knowledge base, AI bot, and routing rules.
        </p>
        <form onSubmit={handleCreateDepartment}>
          <label>
            Department Name *
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="e.g., Support, Sales, Billing"
              disabled={isCreatingDept}
            />
          </label>
          <label>
            Description
            <textarea
              value={newDeptDesc}
              onChange={(e) => setNewDeptDesc(e.target.value)}
              placeholder="e.g., Technical support team"
              rows={3}
              disabled={isCreatingDept}
            />
          </label>
          <button type="submit" disabled={isCreatingDept || !newDeptName.trim()}>
            {isCreatingDept ? "Creating..." : "Create Department"}
          </button>
        </form>
      </section>

      <section className="card">
        <h3>Departments ({departments.length})</h3>
        {departments.length === 0 ? (
          <p style={{ color: "#666" }}>No departments yet. Create one above!</p>
        ) : (
          <div className="list">
            {departments.map((dept) => (
              <div key={dept.id} className="card" style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 5px 0" }}>{dept.name}</h4>
                    {dept.description && (
                      <p style={{ margin: "5px 0", color: "#666", fontSize: "14px" }}>
                        {dept.description}
                      </p>
                    )}
                    <p style={{ margin: "5px 0", color: "#999", fontSize: "12px" }}>
                      Created {new Date(dept.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id)}
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
