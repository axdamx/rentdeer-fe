import { NextResponse } from "next/server";
import { getContentPage } from "@/lib/content-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const page = await getContentPage(slug);
  if (!page) {
    return NextResponse.json({ error: "Content not found." }, { status: 404 });
  }
  return NextResponse.json({ data: page });
}
