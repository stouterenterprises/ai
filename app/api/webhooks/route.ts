import { NextResponse } from "next/server";
import { execute } from "@/lib/db";
import crypto from "crypto";

const verifySignature = (payload: string, signature: string | null) => {
  const secret = process.env.WEBHOOK_SIGNING_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-nimbus-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  await execute(
    `insert into event_log (business_id, department_id, event_type, payload)
     values (?, ?, ?, ?)`,
    [event.businessId, event.departmentId ?? null, event.type, JSON.stringify(event)]
  );

  return NextResponse.json({ received: true });
}
