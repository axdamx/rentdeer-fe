import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { navigationVisibilityInputSchema } from "@/lib/navigation";
import {
  getNavigationVisibility,
  saveNavigationVisibility,
} from "@/lib/navigation-repository";

export async function GET() {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return NextResponse.json({ data: await getNavigationVisibility() });
  } catch {
    return NextResponse.json(
      { error: "Unable to load navigation settings." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = navigationVisibilityInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid navigation settings." },
      { status: 400 },
    );
  try {
    const data = await saveNavigationVisibility(parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Unable to save navigation settings." },
      { status: 500 },
    );
  }
}
