import { NextResponse } from "next/server";
import { getPropertyBySlug } from "@/lib/property-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const property = await getPropertyBySlug(slug);
    if (!property) {
      return NextResponse.json(
        { error: "Property not found." },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: property });
  } catch (error) {
    console.error("Unable to load property", error);
    return NextResponse.json(
      { error: "Unable to load the property." },
      { status: 500 },
    );
  }
}
