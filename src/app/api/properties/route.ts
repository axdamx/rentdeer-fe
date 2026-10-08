import { NextResponse } from "next/server";
import { listProperties } from "@/lib/property-repository";
import {
  LISTINGS_PAGE_SIZE,
  positiveInteger,
  readPropertySearch,
} from "@/lib/property-search";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const result = await listProperties({
      ...readPropertySearch(params),
      page: positiveInteger(params.get("page"), 1),
      pageSize: positiveInteger(
        params.get("pageSize"),
        LISTINGS_PAGE_SIZE,
        100,
      ),
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
