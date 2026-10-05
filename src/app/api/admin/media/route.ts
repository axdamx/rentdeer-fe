import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const allowedTypes = new Set([
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
    const ownerType = String(formData.get("ownerType") ?? "");
    const ownerId = String(formData.get("ownerId") ?? "");
    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File);

    if (
      !ownerId ||
      !["property", "rentalOption", "contentSection"].includes(ownerType)
    ) {
      return NextResponse.json(
        { error: "Invalid media owner." },
        { status: 400 },
      );
    }
    if (!files.length || files.length > 12) {
      return NextResponse.json(
        { error: "Choose between 1 and 12 images." },
        { status: 400 },
      );
    }
    if (
      files.some(
        (file) => !allowedTypes.has(file.type) || file.size > maxFileSize,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Images must be JPG, PNG, WebP or AVIF and no larger than 10MB.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const ownerTable =
      ownerType === "property"
        ? "properties"
        : ownerType === "rentalOption"
          ? "rental_options"
          : "content_sections";
    const { data: owner } = await supabase
      .from(ownerTable)
      .select("id")
      .eq("id", ownerId)
      .maybeSingle();
    if (!owner) {
      return NextResponse.json(
        { error: "Listing not found." },
        { status: 404 },
      );
    }

    const ownerColumn =
      ownerType === "property"
        ? "property_id"
        : ownerType === "rentalOption"
          ? "rental_option_id"
          : "content_section_id";
    const folder =
      ownerType === "property"
        ? "properties"
        : ownerType === "rentalOption"
          ? "rental-options"
          : "content-sections";
    const { count } = await supabase
      .from("media_assets")
      .select("id", { count: "exact", head: true })
      .eq(ownerColumn, ownerId);
    const uploaded: Array<{ id: string; path: string }> = [];

    for (const [index, file] of files.entries()) {
      const path = `${folder}/${ownerId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: media, error: mediaError } = await supabase
        .from("media_assets")
        .insert({
          [ownerColumn]: ownerId,
          bucket: "listing-media",
          object_path: path,
          alt_text: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
          mime_type: file.type,
          is_cover: (count ?? 0) === 0 && index === 0,
          sort_order: (count ?? 0) + index,
          created_by: admin.id,
        })
        .select("id")
        .single();
      if (mediaError) {
        await supabase.storage.from("listing-media").remove([path]);
        throw mediaError;
      }
      uploaded.push({ id: media.id, path });
    }

    return NextResponse.json({ data: uploaded }, { status: 201 });
  } catch (error) {
    console.error("Unable to upload media", error);
    return NextResponse.json(
      { error: "Unable to upload the selected images." },
      { status: 500 },
    );
  }
}
