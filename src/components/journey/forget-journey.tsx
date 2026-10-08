"use client"

import { useEffect } from "react"

import { removeSaved } from "@/lib/journey/local"

/** Trang "Không tìm thấy kế hoạch": bỏ link hỏng khỏi danh sách trên trình duyệt này. */
export function ForgetJourney({ token }: { token: string }): null {
  useEffect(() => {
    removeSaved((item) => item.token === token)
  }, [token])
  return null
}
