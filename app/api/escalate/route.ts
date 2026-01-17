import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { businessId, departmentId, subject, customerEmail, conversationId } = await request.json();

    if (!businessId || !departmentId || !subject) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a ticket from the conversation
    await execute(
      "INSERT INTO tickets (business_id, department_id, subject, conversation_id, status, customer_email) VALUES (?, ?, ?, ?, ?, ?)",
      [businessId, departmentId, subject, conversationId || null, "open", customerEmail || null]
    );

    const tickets = await query(
      "SELECT id, business_id, department_id, subject, status, created_at FROM tickets ORDER BY created_at DESC LIMIT 1"
    );

    return NextResponse.json({
      success: true,
      ticket: tickets[0]
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
