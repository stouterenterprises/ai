import ChatComposer from "@/components/chat-composer";
import { getDepartmentOptions } from "@/lib/data";

export default async function WidgetPreview() {
  const departments = await getDepartmentOptions();

  return (
    <div className="card">
      <p className="eyebrow">Widget preview</p>
      <h3>Start a conversation</h3>
      <label>
        Department
        <select>
          <option value="">Auto-route (recommended)</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </label>
      <ChatComposer />
    </div>
  );
}
