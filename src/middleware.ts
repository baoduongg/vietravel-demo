import { NextResponse, type NextRequest } from "next/server"

export const AUTH_COOKIE = "demo_auth"
const PUBLIC_PATHS = new Set(["/login", "/api/login"])
const PARTNER_IMAGE = /^\/api\/partners\/[^/]+\/image\/\d+$/

export async function hashPassword(password: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Ảnh đối tác: bộ tối ưu next/image tải không kèm cookie đăng nhập (giống /images/).
  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith("/_next") || pathname === "/favicon.ico" || PARTNER_IMAGE.test(pathname)) {
    return NextResponse.next()
  }

  // Thiếu mật khẩu thì đóng cửa: hash của chuỗi rỗng ai cũng biết.
  const password = process.env.DEMO_PASSWORD
  if (!password) return NextResponse.json({ error: "Máy chủ chưa cấu hình DEMO_PASSWORD." }, { status: 503 })

  const expected = await hashPassword(password)
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
  // /images/: ảnh tĩnh công khai trong public; bộ tối ưu next/image tải chúng không kèm cookie đăng nhập.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
}
