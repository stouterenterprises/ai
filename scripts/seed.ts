import { v4 as uuidv4 } from "uuid";
import mysql from "mysql2/promise";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const database = process.env.MYSQL_DATABASE;
const port = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : undefined;

if (!databaseUrl && (!host || !user || !password || !database)) {
  throw new Error("Missing DATABASE_URL or MySQL environment variables");
}

const getPostgresPool = () => {
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL environment variable");
  }
  const sslRequired = databaseUrl.includes("sslmode=require");
  return new Pool({
    connectionString: databaseUrl,
    ssl: sslRequired ? { rejectUnauthorized: false } : undefined
  });
};

const seed = async () => {
  if (databaseUrl) {
    const pool = getPostgresPool();
    const businessId = uuidv4();
    const supportId = uuidv4();
    const salesId = uuidv4();

    await pool.query(
      `insert into businesses (id, name, slug, allow_department_picker)
       values ($1, $2, $3, $4)`,
      [businessId, "Nimbus Labs", "nimbus", true]
    );

    await pool.query(
      `insert into departments (id, business_id, name, description, routing_keywords)
       values ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)`,
      [
        supportId,
        businessId,
        "Support",
        "Technical troubleshooting",
        JSON.stringify(["bug", "error", "issue"]),
        salesId,
        businessId,
        "Sales",
        "Lead qualification",
        JSON.stringify(["pricing", "demo", "trial"])
      ]
    );

    await pool.query(
      `insert into ai_bots (id, business_id, department_id, name, system_prompt, tone)
       values ($1, $2, $3, $4, $5, $6), ($7, $8, $9, $10, $11, $12)`,
      [
        uuidv4(),
        businessId,
        supportId,
        "Support Concierge",
        "You are the support concierge for Nimbus.",
        "Empathetic and precise",
        uuidv4(),
        businessId,
        salesId,
        "Sales Concierge",
        "You are the sales concierge for Nimbus.",
        "Consultative and upbeat"
      ]
    );

    await pool.query(
      `insert into kb_articles (id, business_id, department_id, title, summary, url, status)
       values ($1, $2, $3, $4, $5, $6, 'published'), ($7, $8, $9, $10, $11, $12, 'published')`,
      [
        uuidv4(),
        businessId,
        supportId,
        "Resetting your Nimbus password",
        "Steps to reset your password safely.",
        "https://nimbus.example.com/help/password",
        uuidv4(),
        businessId,
        salesId,
        "Nimbus pricing overview",
        "Compare tiers and add-ons.",
        "https://nimbus.example.com/help/pricing"
      ]
    );

    await pool.query(
      `insert into integrations (id, business_id, name, provider, status, config)
       values ($1, $2, $3, $4, $5, $6), ($7, $8, $9, $10, $11, $12)`,
      [
        uuidv4(),
        businessId,
        "Zapier",
        "zapier",
        "connected",
        JSON.stringify({ webhookUrl: "https://hooks.zapier.com/demo" }),
        uuidv4(),
        businessId,
        "Twilio",
        "twilio",
        "inactive",
        JSON.stringify({})
      ]
    );

    await pool.end();
    console.log("Seeded business", businessId);
    return;
  }

  const connection = await mysql.createConnection({ host, user, password, database, port });
  const businessId = uuidv4();
  const supportId = uuidv4();
  const salesId = uuidv4();

  await connection.execute(
    `insert into businesses (id, name, slug, allow_department_picker)
     values (?, ?, ?, ?)`,
    [businessId, "Nimbus Labs", "nimbus", 1]
  );

  await connection.execute(
    `insert into departments (id, business_id, name, description, routing_keywords)
     values (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`,
    [
      supportId,
      businessId,
      "Support",
      "Technical troubleshooting",
      JSON.stringify(["bug", "error", "issue"]),
      salesId,
      businessId,
      "Sales",
      "Lead qualification",
      JSON.stringify(["pricing", "demo", "trial"])
    ]
  );

  await connection.execute(
    `insert into ai_bots (id, business_id, department_id, name, system_prompt, tone)
     values (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
      businessId,
      supportId,
      "Support Concierge",
      "You are the support concierge for Nimbus.",
      "Empathetic and precise",
      uuidv4(),
      businessId,
      salesId,
      "Sales Concierge",
      "You are the sales concierge for Nimbus.",
      "Consultative and upbeat"
    ]
  );

  await connection.execute(
    `insert into kb_articles (id, business_id, department_id, title, summary, url, status)
     values (?, ?, ?, ?, ?, ?, 'published'), (?, ?, ?, ?, ?, ?, 'published')`,
    [
      uuidv4(),
      businessId,
      supportId,
      "Resetting your Nimbus password",
      "Steps to reset your password safely.",
      "https://nimbus.example.com/help/password",
      uuidv4(),
      businessId,
      salesId,
      "Nimbus pricing overview",
      "Compare tiers and add-ons.",
      "https://nimbus.example.com/help/pricing"
    ]
  );

  await connection.execute(
    `insert into integrations (id, business_id, name, provider, status, config)
     values (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
      businessId,
      "Zapier",
      "zapier",
      "connected",
      JSON.stringify({ webhookUrl: "https://hooks.zapier.com/demo" }),
      uuidv4(),
      businessId,
      "Twilio",
      "twilio",
      "inactive",
      JSON.stringify({})
    ]
  );

  await connection.end();
  console.log("Seeded business", businessId);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
