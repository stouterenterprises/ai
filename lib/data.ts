import { query } from "@/lib/db";

const fallback = {
  departments: [
    {
      id: "dept_sales",
      name: "Sales",
      description: "Lead qualification and product discovery"
    },
    {
      id: "dept_support",
      name: "Support",
      description: "Technical troubleshooting and incident response"
    }
  ],
  bots: [
    {
      id: "bot_support",
      name: "Support Concierge",
      tone: "Friendly, concise, and empathetic"
    }
  ],
  integrations: [
    { id: "zapier", name: "Zapier", status: "Connected" },
    { id: "twilio", name: "Twilio", status: "Needs credentials" }
  ],
  tickets: [
    {
      id: "ticket_1",
      subject: "Cannot reset password",
      status: "open",
      departmentName: "Support"
    }
  ],
  articles: [
    {
      id: "kb_1",
      title: "Getting started with Nimbus",
      summary: "Learn the basics of onboarding and setup.",
      departmentName: "Global"
    }
  ],
  queue: [
    {
      id: "conv_1",
      title: "Billing question",
      preview: "Need help understanding my invoice",
      departmentName: "Billing"
    }
  ]
};

export const getPublicArticles = async () => {
  try {
    const articles = await query<{
      id: string;
      title: string;
      summary: string | null;
      departmentName: string | null;
    }>(
      `select kb_articles.id, kb_articles.title, kb_articles.summary, departments.name as departmentName
       from kb_articles
       left join departments on kb_articles.department_id = departments.id
       where kb_articles.status = 'published'
       order by kb_articles.created_at desc
       limit 6`
    );
    if (!articles.length) return fallback.articles;
    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      summary: article.summary ?? "",
      departmentName: article.departmentName ?? "Global"
    }));
  } catch {
    return fallback.articles;
  }
};

export const getCustomerTickets = async () => {
  try {
    const tickets = await query<{
      id: string;
      subject: string;
      status: string;
      departmentName: string | null;
    }>(
      `select tickets.id, tickets.subject, tickets.status, departments.name as departmentName
       from tickets
       left join departments on tickets.department_id = departments.id
       order by tickets.created_at desc
       limit 5`
    );
    if (!tickets.length) return fallback.tickets;
    return tickets.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      departmentName: ticket.departmentName ?? "General"
    }));
  } catch {
    return fallback.tickets;
  }
};

export const getAgentQueue = async () => {
  try {
    const conversations = await query<{
      id: string;
      subject: string | null;
      departmentName: string | null;
    }>(
      `select conversations.id, conversations.subject, departments.name as departmentName
       from conversations
       left join departments on conversations.department_id = departments.id
       where conversations.status = 'open'
       order by conversations.created_at desc
       limit 5`
    );
    if (!conversations.length) return fallback.queue;
    return conversations.map((conversation) => ({
      id: conversation.id,
      title: conversation.subject ?? "Conversation",
      preview: "Open conversation",
      departmentName: conversation.departmentName ?? "General"
    }));
  } catch {
    return fallback.queue;
  }
};

export const getAdminOverview = async () => {
  try {
    const [departments, bots, integrations] = await Promise.all([
      query<{ id: string; name: string; description: string | null }>(
        `select id, name, description from departments order by created_at desc limit 5`
      ),
      query<{ id: string; name: string; tone: string }>(
        `select id, name, tone from ai_bots order by created_at desc limit 5`
      ),
      query<{ id: string; name: string; status: string }>(
        `select id, name, status from integrations order by created_at desc limit 5`
      )
    ]);
    return {
      departments: departments.length ? departments : fallback.departments,
      bots: bots.length ? bots : fallback.bots,
      integrations: integrations.length ? integrations : fallback.integrations
    };
  } catch {
    return {
      departments: fallback.departments,
      bots: fallback.bots,
      integrations: fallback.integrations
    };
  }
};

export const getDepartmentOptions = async () => {
  try {
    const departments = await query<{ id: string; name: string }>(
      `select id, name from departments order by name asc`
    );
    return departments.length ? departments : fallback.departments;
  } catch {
    return fallback.departments;
  }
};
