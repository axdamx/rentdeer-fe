import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings";

export async function GET() {
  try {
    return NextResponse.json({ data: await getSiteSettings() });
  } catch (error) {
    console.error("Unable to load site settings", error);
    return NextResponse.json(
      { error: "Unable to load site settings." },
      { status: 500 },
    );
  }
}
