import { NextResponse } from "next/server";
import { addressLookupSchema, lookupAddress } from "@/lib/address-geocoding";
import { getAdminUser } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const parsed = addressLookupSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter the full property address before searching." },
      { status: 400 },
    );
  }
  try {
    return NextResponse.json({
      data: await lookupAddress(parsed.data.address),
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Address search is unavailable. Please try again or set the coordinates manually.",
      },
      { status: 502 },
    );
  }
}
