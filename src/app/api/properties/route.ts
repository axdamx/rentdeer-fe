import { NextResponse } from "next/server";
import { listProperties } from "@/lib/property-repository";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const result = await listProperties({
      query: params.get("query") ?? undefined,
      city: params.get("city") ?? undefined,
      page: Number(params.get("page") ?? 1),
      pageSize: Number(params.get("pageSize") ?? 24),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Unable to load properties", error);
    return NextResponse.json(
      { error: "Unable to load properties." },
      { status: 500 },
    );
  }
}
