"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"
import { toast } from "sonner"

import { JourneyError } from "@/lib/journey/errors"
import { readSaved, removeSaved, saveJourney } from "@/lib/journey/local"
import { applyOp, type OpDeps } from "@/lib/journey/operations"
import { newerJourney } from "@/lib/journey/sync"
import { getErrorMessage } from "@/services/http"
import { journeyService } from "@/services/journey.service"
import type { JourneyOp, JourneyRole, PublicJourney, ServiceItem } from "@/types/journey"

const POLL_MS = 3000

export interface JourneyState {
  journey: PublicJourney
  role: JourneyRole
  /** Chỉ có khi đã nhập tên trên link sửa và vẫn là thành viên của kế hoạch. */
  memberId: string | undefined
  /** false cho tới khi đọc xong localStorage; trước đó chưa biết người xem đã nhập tên chưa. */
  memberKnown: boolean
  offline: boolean
  missing: boolean
  send: (op: JourneyOp) => Promise<boolean>
  join: (name: string) => Promise<boolean>
}

export function useJourney(token: string, initial: { journey: PublicJourney; role: JourneyRole }, services: ServiceItem[]): JourneyState {
  const { role } = initial
  const [journey, setJourney] = useState(initial.journey)
  // null = chưa đọc localStorage (render phía server và lần render đầu).
  const [savedMemberId, setSavedMemberId] = useState<string | undefined | null>(null)
  const [offline, setOffline] = useState(false)
  const [missing, setMissing] = useState(false)
  const journeyRef = useRef(initial.journey)
  // Bản server mới nhất đã xác nhận: đích rollback khi thao tác lỗi, và mốc để bỏ kết quả poll đến muộn.
  const serverRef = useRef(initial.journey)
  const pendingRef = useRef(0)

  const memberKnown = savedMemberId !== null
  const memberId = savedMemberId && journey.members.some((member) => member.id === savedMemberId) ? savedMemberId : undefined

  const accept = useCallback((next: PublicJourney) => {
    journeyRef.current = next
    setJourney(next)
  }, [])

  /** Ghi nhận bản server vừa nhận; trả về bản mới nhất đã biết. */
  const confirm = useCallback((incoming: PublicJourney): PublicJourney => {
    serverRef.current = newerJourney(serverRef.current, incoming)
    return serverRef.current
  }, [])

  // Nhớ kế hoạch vào "Kế hoạch của tôi" và lấy lại tên đã nhập trên trình duyệt này.
  useEffect(() => {
    const saved = readSaved().find((item) => item.id === journey.id)
    setSavedMemberId(saved?.memberId)
    saveJourney({ id: journey.id, token, title: journey.title, role, memberId: saved?.memberId })
  }, [journey.id, journey.title, role, token])

  // Hỏi lại server mỗi 3 giây; bỏ qua khi đang gửi thao tác để không đè bản lạc quan.
  useEffect(() => {
    let busy = false
    const timer = window.setInterval(async () => {
      if (busy || pendingRef.current > 0 || document.hidden) return
      busy = true
      try {
        const result = await journeyService.get(token, serverRef.current.version)
        setOffline(false)
        // Chỉ nhận bản mới hơn bản server đã biết: phản hồi thao tác của chính mình có thể về trước poll.
        if (result && pendingRef.current === 0 && result.journey.version > serverRef.current.version) {
          accept(confirm(result.journey))
          toast("Kế hoạch vừa được cập nhật", { id: "journey-updated" })
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          removeSaved((item) => item.token === token)
          setMissing(true)
        }
        else setOffline(true)
      } finally {
        busy = false
      }
    }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [token, accept, confirm])

  const deps = useMemo<OpDeps>(
    () => ({
      lookup: (id) => services.find((service) => service.id === id),
      // id tạm cho bản lạc quan; server trả id thật ngay sau đó. Không dùng crypto.randomUUID vì cần https.
      newId: () => `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      now: () => new Date(),
    }),
    [services],
  )

  const send = useCallback(
    async (op: JourneyOp): Promise<boolean> => {
      const before = journeyRef.current
      try {
        accept(applyOp(before, op, { role, memberId }, deps))
      } catch (error) {
        toast.error(error instanceof JourneyError ? error.message : "Thao tác không hợp lệ.")
        return false
      }
      pendingRef.current += 1
      try {
        const result = await journeyService.op(before.id, { token, memberId, op })
        accept(confirm(result.journey))
        return true
      } catch (error) {
        // Về bản server mới nhất, không về ảnh chụp lúc bấm: thao tác khác có thể đã thành công sau đó.
        accept(serverRef.current)
        toast.error(getErrorMessage(error, "Chưa lưu được thay đổi, Quý khách thử lại nhé."))
        return false
      } finally {
        pendingRef.current -= 1
      }
    },
    [accept, confirm, deps, memberId, role, token],
  )

  const join = useCallback(
    async (name: string): Promise<boolean> => {
      pendingRef.current += 1
      try {
        const result = await journeyService.op(journeyRef.current.id, { token, op: { type: "join", name } })
        accept(confirm(result.journey))
        if (result.memberId) {
          setSavedMemberId(result.memberId)
          saveJourney({ id: result.journey.id, token, title: result.journey.title, role, memberId: result.memberId })
        }
        return true
      } catch (error) {
        toast.error(getErrorMessage(error, "Chưa vào được kế hoạch, Quý khách thử lại nhé."))
        return false
      } finally {
        pendingRef.current -= 1
      }
    },
    [accept, confirm, role, token],
  )

  return { journey, role, memberId, memberKnown, offline, missing, send, join }
}
