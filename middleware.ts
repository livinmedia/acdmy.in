import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup"];
const PUBLIC_PREFIXES = ["/api/auth", "/api/stripe/webhook"];
const AUTH_ONLY_ROUTES = ["/subscribe"];
const AUTH_ONLY_PREFIXES = ["/api/stripe/checkout", "/api/stripe/portal"];

function isPublic(pathname: string) {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function isAuthOnly(pathname: string) {
  if (AUTH_ONLY_ROUTES.includes(pathname)) return true;
  return AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create response to pass through
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public routes — allow everyone
  if (isPublic(pathname)) {
    return response;
  }

  // No user — redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Auth-only routes (subscribe page, stripe API) — no subscription check
  if (isAuthOnly(pathname)) {
    return response;
  }

  // Protected routes — check subscription status
  const { data: student } = await supabase
    .from("students")
    .select("plan_status")
    .eq("id", user.id)
    .single();

  if (student?.plan_status !== "active") {
    const url = request.nextUrl.clone();
    url.pathname = "/subscribe";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|og-image.png|mockup.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
