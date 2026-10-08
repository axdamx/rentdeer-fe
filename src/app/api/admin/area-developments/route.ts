import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { listAreaDevelopments } from "@/lib/property-repository";

export async function GET() {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ data: await listAreaDevelopments() });
}
