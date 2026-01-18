import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, insertOne } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const businesses = await query("businesses", {}, "id, name, description, created_at");
    return NextResponse.json(businesses);
  } catch (error) {
    console.error("Database error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Failed to load businesses",
        details: errorMessage
      },
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

    const business = await insertOne("businesses", {
      id: crypto.randomUUID(),
      name,
      description: description || null,
      slug: name.toLowerCase().replace(/\s+/g, "-")
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
