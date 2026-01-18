import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, insertOne } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");
    const departmentId = searchParams.get("departmentId");
    const ticketStatus = searchParams.get("status");

    const filter: any = {};
    if (businessId) filter.business_id = businessId;
    if (departmentId) filter.department_id = departmentId;
    if (ticketStatus) filter.status = ticketStatus;

    const tickets = await query(
      "tickets",
      filter,
      "id, business_id, department_id, subject, status, created_at"
    );
    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId, departmentId, subject, conversationId } = await request.json();

    if (!businessId || !departmentId || !subject) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newTicket = await insertOne("tickets", {
      id: crypto.randomUUID(),
      business_id: businessId,
      department_id: departmentId,
      subject,
      conversation_id: conversationId || null,
      status: "open"
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
