import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, execute } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const departments = await query(
      "SELECT id, business_id, name, description, created_at FROM departments WHERE business_id = ? ORDER BY name ASC",
      [params.businessId]
    );

    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    await execute(
      "INSERT INTO departments (business_id, name, description) VALUES (?, ?, ?)",
      [params.businessId, name, description || null]
    );

    const departments = await query(
      "SELECT id, business_id, name, description, created_at FROM departments WHERE business_id = ? ORDER BY created_at DESC LIMIT 1",
      [params.businessId]
    );

    return NextResponse.json(departments[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
