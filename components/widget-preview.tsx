"use client";

import { useState, useEffect } from "react";
import ChatComposer from "@/components/chat-composer";

interface Department {
  id: string;
  name: string;
}

export default function WidgetPreview() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDepartments() {
      try {
        const response = await fetch("/api/departments");
        if (response.ok) {
          const data = await response.json();
          setDepartments(data);
        }
      } catch (error) {
        console.error("Failed to load departments:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDepartments();
  }, []);

  return (
    <div className="card">
      <p className="eyebrow">Widget preview</p>
      <h3>Start a conversation</h3>
      <label>
        Department
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          disabled={isLoading}
        >
          <option value="">Auto-route (recommended)</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </label>
      <ChatComposer departmentId={selectedDepartment} />
    </div>
  );
}
