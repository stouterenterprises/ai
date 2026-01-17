import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, execute } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string; departmentId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const departments = await query(
      "SELECT id, business_id, name, description, created_at FROM departments WHERE id = ? AND business_id = ?",
      [params.departmentId, params.businessId]
    );

    if (!departments.length) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(departments[0]);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { businessId: string; departmentId: string } }
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
      "UPDATE departments SET name = ?, description = ? WHERE id = ? AND business_id = ?",
      [name, description || null, params.departmentId, params.businessId]
    );

    const departments = await query(
      "SELECT id, business_id, name, description, created_at FROM departments WHERE id = ?",
      [params.departmentId]
    );

    return NextResponse.json(departments[0]);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { businessId: string; departmentId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await execute(
      "DELETE FROM departments WHERE id = ? AND business_id = ?",
      [params.departmentId, params.businessId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
