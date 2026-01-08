import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { businessId, url } = await request.json();

  if (!businessId || !url) {
    return NextResponse.json({ error: "Missing businessId or url" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      business_id: businessId,
      type: "website_ingest",
      payload: { url },
      status: "queued"
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ job: data });
}
