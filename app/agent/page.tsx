import { getAgentQueue } from "@/lib/data";

export default async function AgentPage() {
  const queue = await getAgentQueue();

  return (
    <div>
      <section className="card">
        <p className="eyebrow">Agent Inbox</p>
        <h2>Department queues</h2>
        <p>Monitor conversations, triage tickets, and collaborate internally.</p>
      </section>
      <section>
        <ul className="list">
          {queue.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.preview}</p>
              <small>{item.departmentName}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
