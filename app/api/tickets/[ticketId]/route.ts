import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, update, deleteRows } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tickets = await query(
      "tickets",
      { id: params.ticketId },
      "id, business_id, department_id, subject, status, conversation_id, created_at"
    );

    if (!tickets.length) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(tickets[0]);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, status } = await request.json();

    const updateData: any = {};

    if (subject !== undefined) {
      updateData.subject = subject;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    await update("tickets", { id: params.ticketId }, updateData);

    const tickets = await query(
      "tickets",
      { id: params.ticketId },
      "id, business_id, department_id, subject, status, conversation_id, created_at"
    );

    return NextResponse.json(tickets[0]);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteRows("tickets", { id: params.ticketId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
