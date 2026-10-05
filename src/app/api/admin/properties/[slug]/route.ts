import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { propertyInputSchema } from "@/lib/listing-schema";
import {
  getPropertyBySlug,
  propertyToInput,
  saveProperty,
} from "@/lib/property-repository";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const property = await getPropertyBySlug(slug, true);
    if (!property) {
      return NextResponse.json(
        { error: "Listing not found." },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: propertyToInput(property) });
  } catch (error) {
    console.error("Unable to load admin property", error);
    return NextResponse.json(
      { error: "Unable to load the listing." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const existing = await getPropertyBySlug(slug, true);
    if (!existing?.id) {
      return NextResponse.json(
        { error: "Listing not found." },
        { status: 404 },
      );
    }
    const parsed = propertyInputSchema.safeParse({
      ...(await request.json()),
      id: existing.id,
    });
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please correct the listing fields.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }
    const data = await saveProperty(parsed.data, admin.id);
    revalidatePath("/properties");
    revalidatePath(`/properties/${slug}`);
    if (parsed.data.slug !== slug) {
      revalidatePath(`/properties/${parsed.data.slug}`);
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unable to update property", error);
    return NextResponse.json(
      { error: "Unable to update the listing." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { slug } = await params;
  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({ status: "archived", updated_by: admin.id })
    .eq("slug", slug);
  if (error) {
    console.error("Unable to archive property", error);
    return NextResponse.json(
      { error: "Unable to archive the listing." },
      { status: 500 },
    );
  }
  revalidatePath("/properties");
  return NextResponse.json({ success: true });
}
