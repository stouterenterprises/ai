import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const seed = async () => {
  const businessId = uuidv4();
  const supportId = uuidv4();
  const salesId = uuidv4();

  await supabase.from("businesses").insert({
    id: businessId,
    name: "Nimbus Labs",
    slug: "nimbus",
    allow_department_picker: true
  });

  await supabase.from("departments").insert([
    {
      id: supportId,
      business_id: businessId,
      name: "Support",
      description: "Technical troubleshooting",
      routing_keywords: ["bug", "error", "issue"]
    },
    {
      id: salesId,
      business_id: businessId,
      name: "Sales",
      description: "Lead qualification",
      routing_keywords: ["pricing", "demo", "trial"]
    }
  ]);

  await supabase
    .from("ai_bots")
    .insert([
      {
        business_id: businessId,
        department_id: supportId,
        name: "Support Concierge",
        system_prompt: "You are the support concierge for Nimbus.",
        tone: "Empathetic and precise"
      },
      {
        business_id: businessId,
        department_id: salesId,
        name: "Sales Concierge",
        system_prompt: "You are the sales concierge for Nimbus.",
        tone: "Consultative and upbeat"
      }
    ]);

  await supabase.from("kb_articles").insert([
    {
      business_id: businessId,
      department_id: supportId,
      title: "Resetting your Nimbus password",
      summary: "Steps to reset your password safely.",
      url: "https://nimbus.example.com/help/password"
    },
    {
      business_id: businessId,
      department_id: salesId,
      title: "Nimbus pricing overview",
      summary: "Compare tiers and add-ons.",
      url: "https://nimbus.example.com/help/pricing"
    }
  ]);

  await supabase.from("integrations").insert([
    {
      business_id: businessId,
      name: "Zapier",
      provider: "zapier",
      status: "connected",
      config: { webhookUrl: "https://hooks.zapier.com/demo" }
    },
    {
      business_id: businessId,
      name: "Twilio",
      provider: "twilio",
      status: "inactive",
      config: {}
    }
  ]);

  console.log("Seeded business", businessId);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
