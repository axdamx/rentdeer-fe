import { NextResponse } from "next/server";
import { enquiryInputSchema } from "@/lib/listing-schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const parsed = enquiryInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please complete all required enquiry fields." },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const supabase = await createClient();
    let propertyId: string | null = null;
    let rentalOptionId: string | null = null;

    if (input.propertySlug) {
      const { data: property } = await supabase
        .from("properties")
        .select("id")
        .eq("slug", input.propertySlug)
        .eq("status", "published")
        .maybeSingle();
      propertyId = property?.id ?? null;

      if (propertyId && input.rentalOptionSlug) {
        const { data: rentalOption } = await supabase
          .from("rental_options")
          .select("id")
          .eq("property_id", propertyId)
          .eq("slug", input.rentalOptionSlug)
          .eq("status", "published")
          .maybeSingle();
        rentalOptionId = rentalOption?.id ?? null;
      }
    }

    const { error } = await supabase.from("enquiries").insert({
      property_id: propertyId,
      rental_option_id: rentalOptionId,
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone || null,
      topic: input.topic,
      message: input.message,
      consented_at: new Date().toISOString(),
      source_url: input.sourceUrl || null,
      utm_source: input.utmSource || null,
      utm_medium: input.utmMedium || null,
      utm_campaign: input.utmCampaign || null,
    });
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Unable to create enquiry", error);
    return NextResponse.json(
      { error: "Unable to send your enquiry. Please try again." },
      { status: 500 },
    );
  }
}
