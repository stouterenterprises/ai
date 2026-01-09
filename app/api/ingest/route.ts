import { NextResponse } from "next/server";
import { execute } from "@/lib/db";

export async function POST(request: Request) {
  const { businessId, url } = await request.json();

  if (!businessId || !url) {
    return NextResponse.json({ error: "Missing businessId or url" }, { status: 400 });
  }

  try {
    const result = await execute(
      `insert into jobs (business_id, type, payload, status)
       values (?, 'website_ingest', ?, 'queued')`,
      [businessId, JSON.stringify({ url })]
    );
    const insertId = (result as { insertId: number }).insertId;
    return NextResponse.json({ job: { id: insertId } });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
