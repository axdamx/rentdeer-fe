import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { siteSettingsInputSchema } from "@/lib/listing-schema";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings";

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ data: await getSiteSettings() });
}

export async function PATCH(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const parsed = siteSettingsInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please correct the settings fields." },
      { status: 400 },
    );
  }
  try {
    return NextResponse.json({ data: await saveSiteSettings(parsed.data) });
  } catch (error) {
    console.error("Unable to update site settings", error);
    return NextResponse.json(
      { error: "Unable to update site settings." },
      { status: 500 },
    );
  }
}
