import { getDepartmentOptions } from "@/lib/data";

export async function GET() {
  try {
    const departments = await getDepartmentOptions();
    return Response.json(departments);
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return Response.json([], { status: 500 });
  }
}
