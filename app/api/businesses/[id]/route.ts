import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, execute } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const businesses = await query(
      "SELECT id, name, description, created_at FROM businesses WHERE id = ?",
      [params.id]
    );

    if (!businesses.length) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(businesses[0]);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
      "UPDATE businesses SET name = ?, description = ? WHERE id = ?",
      [name, description || null, params.id]
    );

    const businesses = await query(
      "SELECT id, name, description, created_at FROM businesses WHERE id = ?",
      [params.id]
    );

    return NextResponse.json(businesses[0]);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await execute("DELETE FROM businesses WHERE id = ?", [params.id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
