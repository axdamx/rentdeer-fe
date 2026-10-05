import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) return NextResponse.next({ request });

  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin/");
  const isLoginRoute = request.nextUrl.pathname === "/admin";

  if (isAdminRoute && !data?.claims) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && data?.claims) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
