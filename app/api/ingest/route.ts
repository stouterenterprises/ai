import { NextResponse } from "next/server";
import { insertOne } from "@/lib/db";

export async function POST(request: Request) {
  const { businessId, url } = await request.json();

  if (!businessId || !url) {
    return NextResponse.json({ error: "Missing businessId or url" }, { status: 400 });
  }

  try {
    const job = await insertOne("jobs", {
      business_id: businessId,
      type: "website_ingest",
      payload: JSON.stringify({ url }),
      status: "queued"
    });
    return NextResponse.json({ job });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
