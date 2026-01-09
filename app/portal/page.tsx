import { getCustomerTickets } from "@/lib/data";

export default async function PortalPage() {
  const tickets = await getCustomerTickets();

  return (
    <div>
      <section className="card">
        <p className="eyebrow">Customer Portal</p>
        <h2>Your tickets</h2>
        <p>Track status, reply to agents, and review AI summaries.</p>
      </section>
      <section>
        <ul className="list">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <strong>{ticket.subject}</strong>
              <p>Status: {ticket.status}</p>
              <small>Department: {ticket.departmentName}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
