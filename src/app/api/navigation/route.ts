import { NextResponse } from "next/server";
import { getPublicNavigation } from "@/lib/navigation-repository";

export async function GET() {
  try {
    return NextResponse.json(
      { data: await getPublicNavigation() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to load navigation." },
      { status: 500 },
    );
  }
}
