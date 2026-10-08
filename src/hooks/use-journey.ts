"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"
import { toast } from "sonner"

import { JourneyError } from "@/lib/journey/errors"
import { readSaved, saveJourney } from "@/lib/journey/local"
import { applyOp, type OpDeps } from "@/lib/journey/operations"
import { getErrorMessage } from "@/services/http"
import { journeyService } from "@/services/journey.service"
import type { JourneyOp, JourneyRole, PublicJourney, ServiceItem } from "@/types/journey"

const POLL_MS = 3000

export interface JourneyState {
  journey: PublicJourney
  role: JourneyRole
  /** Chỉ có khi đã nhập tên trên link sửa và vẫn là thành viên của kế hoạch. */
  memberId: string | undefined
  offline: boolean
  missing: boolean
  send: (op: JourneyOp) => Promise<boolean>
  join: (name: string) => Promise<boolean>
}

export function useJourney(token: string, initial: { journey: PublicJourney; role: JourneyRole }, services: ServiceItem[]): JourneyState {
  const { role } = initial
  const [journey, setJourney] = useState(initial.journey)
  const [savedMemberId, setSavedMemberId] = useState<string>()
  const [offline, setOffline] = useState(false)
  const [missing, setMissing] = useState(false)
  const journeyRef = useRef(initial.journey)
  const pendingRef = useRef(0)

  const memberId = savedMemberId && journey.members.some((member) => member.id === savedMemberId) ? savedMemberId : undefined

  const accept = useCallback((next: PublicJourney) => {
    journeyRef.current = next
    setJourney(next)
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
        const result = await journeyService.get(token, journeyRef.current.version)
        setOffline(false)
        if (result && pendingRef.current === 0) {
          accept(result.journey)
          toast("Kế hoạch vừa được cập nhật", { id: "journey-updated" })
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) setMissing(true)
        else setOffline(true)
      } finally {
        busy = false
      }
    }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [token, accept])

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
        accept(result.journey)
        return true
      } catch (error) {
        accept(before)
        toast.error(getErrorMessage(error, "Chưa lưu được thay đổi, Quý khách thử lại nhé."))
        return false
      } finally {
        pendingRef.current -= 1
      }
    },
    [accept, deps, memberId, role, token],
  )

  const join = useCallback(
    async (name: string): Promise<boolean> => {
      pendingRef.current += 1
      try {
        const result = await journeyService.op(journeyRef.current.id, { token, op: { type: "join", name } })
        accept(result.journey)
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
    [accept, role, token],
  )

  return { journey, role, memberId, offline, missing, send, join }
}
