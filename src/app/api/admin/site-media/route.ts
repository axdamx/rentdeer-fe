import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const rasterImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const maxFileSize = 10 * 1024 * 1024;

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-120);
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const kind = String(formData.get("kind") ?? "");
    const file = formData.get("file");
    if (!file || !(file instanceof File) || !["logo", "hero"].includes(kind)) {
      return NextResponse.json(
        { error: "Choose a valid image to upload." },
        { status: 400 },
      );
    }
    const allowedTypes =
      kind === "logo"
        ? new Set([...rasterImageTypes, "image/svg+xml"])
        : rasterImageTypes;
    if (!allowedTypes.has(file.type) || file.size > maxFileSize) {
      return NextResponse.json(
        {
          error:
            kind === "logo"
              ? "Logo must be SVG, JPG, PNG, WebP or AVIF and no larger than 10MB."
              : "Hero image must be JPG, PNG, WebP or AVIF and no larger than 10MB.",
        },
        { status: 400 },
      );
    }

    const path = `site-assets/${kind}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from("listing-media")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("listing-media").getPublicUrl(path);
    return NextResponse.json(
      { data: { path, url: data.publicUrl } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unable to upload site media", error);
    return NextResponse.json(
      { error: "Unable to upload the selected image." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    path?: unknown;
  } | null;
  const path = typeof body?.path === "string" ? body.path : "";
  if (!path.startsWith("site-assets/")) {
    return NextResponse.json({ error: "Invalid media path." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.storage.from("listing-media").remove([path]);
  if (error) {
    return NextResponse.json(
      { error: "Unable to remove the stored image." },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}
