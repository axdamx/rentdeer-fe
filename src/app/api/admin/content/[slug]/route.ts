import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getContentPage, saveContentPage } from "@/lib/content-repository";
import { contentPageInputSchema } from "@/lib/listing-schema";

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
  const data = await saveContentPage(parsed.data);
  revalidatePath(parsed.data.route);
  return NextResponse.json({ data });
}
