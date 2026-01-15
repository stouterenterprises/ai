import { NextResponse } from "next/server";
import { execute, getDbAdapter } from "@/lib/db";

export async function POST(request: Request) {
  const { businessId, url } = await request.json();

  if (!businessId || !url) {
    return NextResponse.json({ error: "Missing businessId or url" }, { status: 400 });
  }

  try {
    const adapter = getDbAdapter();
    const sql =
      adapter === "postgres"
        ? `insert into jobs (business_id, type, payload, status)
           values (?, 'website_ingest', ?, 'queued')
           returning id`
        : `insert into jobs (business_id, type, payload, status)
           values (?, 'website_ingest', ?, 'queued')`;
    const result = await execute(sql, [businessId, JSON.stringify({ url })]);
    const insertId =
      adapter === "postgres"
        ? (result as { rows: { id: number }[] }).rows[0]?.id
        : (result as { insertId: number }).insertId;
    return NextResponse.json({ job: { id: insertId } });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
