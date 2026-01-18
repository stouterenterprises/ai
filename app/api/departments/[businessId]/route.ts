import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, insertOne } from "@/lib/db";

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
      "departments",
      { business_id: params.businessId },
      "id, business_id, name, description, created_at"
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

    const newDepartment = await insertOne("departments", {
      id: crypto.randomUUID(),
      business_id: params.businessId,
      name,
      description: description || null
    });

    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
