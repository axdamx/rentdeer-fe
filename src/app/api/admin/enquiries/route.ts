import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(params.get("pageSize") ?? 25)),
  );
  const status = params.get("status");
  const search = params
    .get("query")
    ?.replace(/[^a-zA-Z0-9@._\s'-]/g, " ")
    .trim();
  const supabase = await createClient();
  let query = supabase
    .from("enquiries")
    .select(
      "id, reference, first_name, last_name, email, phone, topic, message, status, created_at, properties(title, slug), rental_options(title, slug)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status && status !== "all") query = query.eq("status", status);
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,reference.ilike.%${search}%`,
    );
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("Unable to load enquiries", error);
    return NextResponse.json(
      { error: "Unable to load enquiries." },
      { status: 500 },
    );
  }
  return NextResponse.json({ data, total: count ?? 0 });
}
