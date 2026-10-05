import { NextResponse } from "next/server"

import { AUTH_COOKIE, hashPassword } from "@/middleware"

export async function POST(request: Request): Promise<NextResponse> {
  const { password } = (await request.json()) as { password?: string }
  const demoPassword = process.env.DEMO_PASSWORD ?? ""

  if (!demoPassword || password !== demoPassword) {
    return NextResponse.json({ error: "Mật khẩu không đúng" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(AUTH_COOKIE, await hashPassword(demoPassword), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
  return response
}
