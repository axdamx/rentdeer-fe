import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  const supabase = await createClient();
  const { data: media, error: readError } = await supabase
    .from("media_assets")
    .select("bucket, object_path")
    .eq("id", id)
    .single();
  if (readError || !media) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  const { error: storageError } = await supabase.storage
    .from(media.bucket)
    .remove([media.object_path]);
  if (storageError) {
    return NextResponse.json(
      { error: "Unable to remove the stored file." },
      { status: 500 },
    );
  }
  const { error: deleteError } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", id);
  if (deleteError) {
    return NextResponse.json(
      { error: "Unable to remove media metadata." },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}
