import { NextResponse } from "next/server";
import { getContentPage } from "@/lib/content-repository";
import { buildLocalAreaCards } from "@/lib/local-areas";
import { listAreaDevelopments } from "@/lib/property-repository";

export async function GET() {
  try {
    const [page, developments] = await Promise.all([
      getContentPage("home"),
      listAreaDevelopments(),
    ]);
    const section = page?.sections.find(
      (item) => item.sectionKey === "local-areas",
    );
    return NextResponse.json({
      data: buildLocalAreaCards(
        developments,
        section?.content.localAreas,
        section?.assets,
      ),
      enabled: Boolean(page) && (section?.content.localAreasEnabled ?? true),
      eyebrow: section?.content.eyebrow ?? "RentDeer in your area",
      heading: section?.content.heading ?? "Serving your local area.",
      description:
        section?.content.description ??
        "Explore managed rooms and homes close to the places that matter to you.",
    });
  } catch (error) {
    console.error("Unable to load local areas", error);
    return NextResponse.json(
      { error: "Unable to load local areas." },
      { status: 500 },
    );
  }
}
