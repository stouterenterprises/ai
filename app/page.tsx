import Link from "next/link";

const cards = [
  {
    title: "Help Center",
    description: "Public knowledge base with department-aware content.",
    href: "/help"
  },
  {
    title: "Messenger Widget",
    description: "Embeddable AI-first chat experience.",
    href: "/widget"
  },
  {
    title: "Customer Portal",
    description: "Customers can track tickets and conversations.",
    href: "/portal"
  },
  {
    title: "Agent Inbox",
    description: "Department queues, live conversations, and ticket triage.",
    href: "/agent"
  },
  {
    title: "Admin",
    description: "Configure departments, bots, routing, and integrations.",
    href: "/admin"
  }
];

export default function HomePage() {
  return (
    <section className="card-grid">
      {cards.map((card) => (
        <Link key={card.title} href={card.href} className="card">
          <h2>{card.title}</h2>
          <p>{card.description}</p>
        </Link>
      ))}
    </section>
  );
}
