import { createServerSupabaseClient } from "@/lib/supabase/server";

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

const canUseSupabase = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const getPublicArticles = async () => {
  if (!canUseSupabase()) return fallback.articles;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("kb_articles")
    .select("id, title, summary, department:departments(name)")
    .eq("status", "published")
    .limit(6);
  if (error || !data) return fallback.articles;
  return data.map((article) => ({
    id: article.id,
    title: article.title,
    summary: article.summary ?? "",
    departmentName: article.department?.name ?? "Global"
  }));
};

export const getCustomerTickets = async () => {
  if (!canUseSupabase()) return fallback.tickets;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tickets")
    .select("id, subject, status, department:departments(name)")
    .limit(5);
  if (error || !data) return fallback.tickets;
  return data.map((ticket) => ({
    id: ticket.id,
    subject: ticket.subject,
    status: ticket.status,
    departmentName: ticket.department?.name ?? "General"
  }));
};

export const getAgentQueue = async () => {
  if (!canUseSupabase()) return fallback.queue;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id, subject, department:departments(name)")
    .eq("status", "open")
    .limit(5);
  if (error || !data) return fallback.queue;
  return data.map((conversation) => ({
    id: conversation.id,
    title: conversation.subject ?? "Conversation",
    preview: "Open conversation",
    departmentName: conversation.department?.name ?? "General"
  }));
};

export const getAdminOverview = async () => {
  if (!canUseSupabase()) {
    return {
      departments: fallback.departments,
      bots: fallback.bots,
      integrations: fallback.integrations
    };
  }
  const supabase = createServerSupabaseClient();
  const [departments, bots, integrations] = await Promise.all([
    supabase.from("departments").select("id, name, description").limit(5),
    supabase.from("ai_bots").select("id, name, tone").limit(5),
    supabase.from("integrations").select("id, name, status").limit(5)
  ]);
  return {
    departments: departments.data ?? fallback.departments,
    bots: bots.data ?? fallback.bots,
    integrations: integrations.data ?? fallback.integrations
  };
};

export const getDepartmentOptions = async () => {
  if (!canUseSupabase()) return fallback.departments;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("departments").select("id, name");
  if (error || !data) return fallback.departments;
  return data;
};
