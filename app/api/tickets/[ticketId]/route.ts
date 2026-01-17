import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, execute } from "@/lib/db";

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
      "SELECT id, business_id, department_id, subject, status, conversation_id, created_at FROM tickets WHERE id = ?",
      [params.ticketId]
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

    let updateFields = [];
    let updateParams = [];

    if (subject !== undefined) {
      updateFields.push("subject = ?");
      updateParams.push(subject);
    }

    if (status !== undefined) {
      updateFields.push("status = ?");
      updateParams.push(status);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    updateParams.push(params.ticketId);
    const sql = `UPDATE tickets SET ${updateFields.join(", ")} WHERE id = ?`;

    await execute(sql, updateParams);

    const tickets = await query(
      "SELECT id, business_id, department_id, subject, status, conversation_id, created_at FROM tickets WHERE id = ?",
      [params.ticketId]
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
    await execute("DELETE FROM tickets WHERE id = ?", [params.ticketId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
