import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { propertyInputSchema } from "@/lib/listing-schema";
import { listProperties, saveProperty } from "@/lib/property-repository";

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const params = new URL(request.url).searchParams;
    const result = await listProperties({
      admin: true,
      query: params.get("query") ?? undefined,
      status: params.get("status") ?? undefined,
      page: Number(params.get("page") ?? 1),
      pageSize: Number(params.get("pageSize") ?? 25),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Unable to load admin properties", error);
    return NextResponse.json(
      { error: "Unable to load listings." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const parsed = propertyInputSchema.safeParse(await request.json());
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
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Unable to create property", error);
    return NextResponse.json(
      { error: "Unable to create the listing." },
      { status: 500 },
    );
  }
}
