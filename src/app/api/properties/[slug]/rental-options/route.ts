import { NextResponse } from "next/server";
import { listRentalOptions } from "@/lib/property-repository";
import { readRentalOptionFilters } from "@/lib/rental-options";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const result = await listRentalOptions(
      slug,
      readRentalOptionFilters(new URL(request.url).searchParams),
    );
    return result
      ? NextResponse.json(result)
      : NextResponse.json({ error: "Property not found." }, { status: 404 });
  } catch (error) {
    console.error("Unable to load rental options", error);
    return NextResponse.json(
      { error: "Unable to load rental options." },
      { status: 500 },
    );
  }
}
