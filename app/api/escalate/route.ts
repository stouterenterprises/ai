import { NextRequest, NextResponse } from "next/server";
import { insertOne } from "@/lib/db";

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
    const ticket = await insertOne("tickets", {
      id: crypto.randomUUID(),
      business_id: businessId,
      department_id: departmentId,
      subject,
      conversation_id: conversationId || null,
      status: "open",
      customer_email: customerEmail || null
    });

    return NextResponse.json({
      success: true,
      ticket
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
