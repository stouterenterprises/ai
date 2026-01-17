import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, execute } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");

    let sql = "SELECT id, business_id, department_id, subject, status, created_at FROM tickets WHERE 1=1";
    const params: any[] = [];

    if (businessId) {
      sql += " AND business_id = ?";
      params.push(businessId);
    }

    if (departmentId) {
      sql += " AND department_id = ?";
      params.push(departmentId);
    }

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    sql += " ORDER BY created_at DESC";

    const tickets = await query(sql, params);
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

    await execute(
      "INSERT INTO tickets (business_id, department_id, subject, conversation_id, status) VALUES (?, ?, ?, ?, ?)",
      [businessId, departmentId, subject, conversationId || null, "open"]
    );

    const tickets = await query(
      "SELECT id, business_id, department_id, subject, status, created_at FROM tickets ORDER BY created_at DESC LIMIT 1"
    );

    return NextResponse.json(tickets[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
