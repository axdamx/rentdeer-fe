import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getContentPage, saveContentPage } from "@/lib/content-repository";
import { contentPageInputSchema } from "@/lib/listing-schema";
import { validLocalAreaSources } from "@/lib/local-areas";
import { listAreaDevelopments } from "@/lib/property-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { slug } = await params;
  const page = await getContentPage(slug, true);
  if (!page) {
    return NextResponse.json({ error: "Content not found." }, { status: 404 });
  }
  return NextResponse.json({ data: page });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const parsed = contentPageInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid page content." },
      { status: 400 },
    );
  }
  const { slug } = await params;
  if (parsed.data.slug !== slug) {
    return NextResponse.json({ error: "Page slug mismatch." }, { status: 400 });
  }
  const existing = await getContentPage(slug, true);
  if (!existing || existing.id !== parsed.data.id) {
    return NextResponse.json(
      { error: "Page identity mismatch." },
      { status: 400 },
    );
  }
  const section = parsed.data.sections.find(
    (item) => item.sectionKey === "local-areas",
  );
  if (section) {
    const storedSection = existing.sections.find(
      (item) => item.sectionKey === "local-areas",
    );
    if (slug !== "home" || storedSection?.id !== section.id) {
      return NextResponse.json(
        { error: "Invalid local area section." },
        { status: 400 },
      );
    }
    const developments = await listAreaDevelopments();
    for (const config of section.content.localAreas) {
      if (
        !validLocalAreaSources(
          config,
          developments,
          storedSection.assets.map((asset) => asset.id),
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Choose published developments in the matching area and an image uploaded to this section.",
          },
          { status: 400 },
        );
      }
    }
    section.isVisible = true;
  }
  const data = await saveContentPage(parsed.data);
  revalidatePath(parsed.data.route);
  return NextResponse.json({ data });
}
