"use client"

import { useCallback, useRef } from "react"
import axios from "axios"
import { toast } from "sonner"

import { company } from "@/config/company"
import { avatarService } from "@/services/avatar.service"
import { getErrorMessage } from "@/services/http"
import { useAvatarStore } from "@/stores/avatar.store"
import type { Tour } from "@/types/tour"

interface UseAvatarConversationResult {
  start: () => void
  ask: (question: string, image?: string) => Promise<void>
  interrupt: () => void
}

/** Hiện thẻ tour kèm phản ứng của mascot: ăn mừng nếu có ưu đãi, không thì chỉ tay về phía thẻ. */
function showTours(tours: Tour[] | undefined): void {
  if (!tours || tours.length === 0) return
  const { setRecommendedTours, engine } = useAvatarStore.getState()
  setRecommendedTours(tours)
  engine?.react?.(tours.some((tour) => tour.deal) ? "celebrate" : "point")
}

export function useAvatarConversation(): UseAvatarConversationResult {
  const requestIdRef = useRef<number>(0)
  const abortRef = useRef<AbortController | null>(null)

  const beginRequest = useCallback((): { id: number; signal: AbortSignal } => {
    requestIdRef.current += 1
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    useAvatarStore.getState().engine?.stop()
    return { id: requestIdRef.current, signal: controller.signal }
  }, [])

  const isCurrent = useCallback((id: number): boolean => id === requestIdRef.current, [])

  const speakReply = useCallback(
    async (text: string, id: number, signal: AbortSignal, tours?: Tour[], prerecorded = false): Promise<void> => {
      const { setStatus, setSubtitle, addMessage } = useAvatarStore.getState()
      try {
        // Lời chào dùng file tạo sẵn; lỗi tải thì rơi về TTS như câu trả lời thường.
        const audio = prerecorded
          ? await avatarService.greeting(signal).catch(() => avatarService.synthesize(text, signal))
          : await avatarService.synthesize(text, signal)
        const engine = useAvatarStore.getState().engine
        if (!isCurrent(id) || !engine) return

        addMessage({ role: "assistant", content: text })
        showTours(tours)
        setSubtitle(text)
        setStatus("speaking")
        await engine.speak(audio)
      } catch (error: unknown) {
        if (axios.isCancel(error) || !isCurrent(id)) return
        addMessage({ role: "assistant", content: text })
        showTours(tours)
        setSubtitle(text)
        toast.error(getErrorMessage(error, "Không phát được giọng nói, em hiển thị câu trả lời bằng chữ ạ."))
      } finally {
        if (isCurrent(id)) setStatus("idle")
      }
    },
    [isCurrent],
  )

  const start = useCallback((): void => {
    const { engine, setStarted, setStatus } = useAvatarStore.getState()
    if (!engine) return
    void engine.unlock()
    setStarted(true)
    const greeting = company.persona.greeting
    const { id, signal } = beginRequest()
    setStatus("thinking")
    void speakReply(greeting, id, signal, undefined, true)
  }, [beginRequest, speakReply])

  const ask = useCallback(
    async (question: string, image?: string): Promise<void> => {
      const content = question.trim() || (image ? "Hãy phân tích hình ảnh này và gợi ý tour Vietravel phù hợp nhất cho tôi." : "")
      if (!content) return
      void useAvatarStore.getState().engine?.unlock()
      const { id, signal } = beginRequest()
      const { addMessage, setStatus, setSubtitle } = useAvatarStore.getState()
      addMessage({ role: "user", content, image })
      setSubtitle("")
      setStatus("thinking")

      try {
        const { reply, tours } = await avatarService.chat(useAvatarStore.getState().messages, signal)
        if (!isCurrent(id)) return
        await speakReply(reply, id, signal, tours)
      } catch (error: unknown) {
        if (axios.isCancel(error) || !isCurrent(id)) return
        setStatus("idle")
        toast.error(getErrorMessage(error, "Em chưa kết nối được máy chủ, Quý khách thử lại giúp em nhé."))
      }
    },
    [beginRequest, isCurrent, speakReply],
  )

  const interrupt = useCallback((): void => {
    beginRequest()
    const { setStatus, setSubtitle } = useAvatarStore.getState()
    setSubtitle("")
    setStatus("idle")
  }, [beginRequest])

  return { start, ask, interrupt }
}
