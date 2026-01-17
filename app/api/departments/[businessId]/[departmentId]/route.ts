import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, update, deleteRows } from "@/lib/db";

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
      "departments",
      { id: params.departmentId, business_id: params.businessId },
      "id, business_id, name, description, created_at"
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

    await update(
      "departments",
      { id: params.departmentId, business_id: params.businessId },
      { name, description: description || null }
    );

    const departments = await query(
      "departments",
      { id: params.departmentId },
      "id, business_id, name, description, created_at"
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
    await deleteRows(
      "departments",
      { id: params.departmentId, business_id: params.businessId }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
