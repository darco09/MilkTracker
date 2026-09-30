import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

const PUBLIC_PATHS = ["/login", "/forgot-password", "/auth/callback"];
// Rute yang tetap boleh diakses walau user sudah punya session
// (mis. recovery session sementara dari link reset password).
const AUTH_EXEMPT_PATHS = ["/reset-password"];

/**
 * Refresh session tiap request & lindungi rute.
 * - Belum login + akses rute privat  -> redirect ke /login
 * - Sudah login + akses /login        -> redirect ke /
 */
export async function updateSession(request: NextRequest) {
  // Guard: tanpa kredensial Supabase, createServerClient akan throw dan
  // membuat SELURUH situs 500 (MIDDLEWARE_INVOCATION_FAILED). Beri pesan jelas.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new NextResponse(
      "Konfigurasi belum lengkap: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "belum di-set. Set Environment Variables di Vercel, lalu Redeploy tanpa build cache.",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } }
    );
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));
  const isAuthExempt = AUTH_EXEMPT_PATHS.some((p) => path.startsWith(p));

  if (!user && !isPublic && !isAuthExempt) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthExempt) {
    return response;
  }

  if (user && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
