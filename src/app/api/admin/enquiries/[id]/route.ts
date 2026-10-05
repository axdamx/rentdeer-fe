import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { enquiryStatusSchema } from "@/lib/listing-schema";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const parsed = enquiryStatusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enquiries")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    return NextResponse.json(
      { error: "Unable to update enquiry." },
      { status: 500 },
    );
  }
  return NextResponse.json({ data });
}
