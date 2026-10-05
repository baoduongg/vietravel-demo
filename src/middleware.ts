import { NextResponse, type NextRequest } from "next/server"

export const AUTH_COOKIE = "demo_auth"
const PUBLIC_PATHS = new Set(["/login", "/api/login"])

export async function hashPassword(password: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next()
  }

  const expected = await hashPassword(process.env.DEMO_PASSWORD ?? "")
  const cookie = request.cookies.get(AUTH_COOKIE)?.value

  if (cookie === expected) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("from", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
