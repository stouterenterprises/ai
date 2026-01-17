import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, execute } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const businesses = await query(
      "SELECT id, name, description, created_at FROM businesses ORDER BY created_at DESC"
    );
    return NextResponse.json(businesses);
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
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    await execute(
      "INSERT INTO businesses (name, description) VALUES (?, ?)",
      [name, description || null]
    );

    const businesses = await query(
      "SELECT id, name, description, created_at FROM businesses ORDER BY created_at DESC LIMIT 1"
    );

    return NextResponse.json(businesses[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
