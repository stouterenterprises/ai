import { getAdminOverview } from "@/lib/data";

export default async function AdminPage() {
  const overview = await getAdminOverview();

  return (
    <div>
      <section className="card">
        <p className="eyebrow">Admin Console</p>
        <h2>Business configuration</h2>
        <p>Manage departments, bots, routing, and integrations.</p>
      </section>

      <section className="card-grid">
        <div className="card">
          <h3>Departments</h3>
          <ul className="list">
            {overview.departments.map((department) => (
              <li key={department.id}>
                <strong>{department.name}</strong>
                <p>{department.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Bots</h3>
          <ul className="list">
            {overview.bots.map((bot) => (
              <li key={bot.id}>
                <strong>{bot.name}</strong>
                <p>{bot.tone}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Integrations</h3>
          <ul className="list">
            {overview.integrations.map((integration) => (
              <li key={integration.id}>
                <strong>{integration.name}</strong>
                <p>{integration.status}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
