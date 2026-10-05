import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { listContentPages } from "@/lib/content-repository";

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ data: await listContentPages(true) });
}
