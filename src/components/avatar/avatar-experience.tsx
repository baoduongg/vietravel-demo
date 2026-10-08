"use client"

import { useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { AnimatePresence, MotionConfig } from "motion/react"
import { toast } from "sonner"

import { StartOverlay } from "@/components/avatar/start-overlay"
import { AvatarModelSwitch } from "@/components/avatar/avatar-model-switch"
import { ChatPanel } from "@/components/avatar/chat-panel"
import { MicButton } from "@/components/avatar/mic-button"
import { SiteHeader } from "@/components/avatar/site-header"
import { StageScenery } from "@/components/avatar/stage-scenery"
import { StatusBadge } from "@/components/avatar/status-badge"
import { Subtitle } from "@/components/avatar/subtitle"
import { SuggestedQuestions } from "@/components/avatar/suggested-questions"
import { ThinkingIndicator } from "@/components/avatar/thinking-indicator"
import { TourCards } from "@/components/avatar/tour-cards"
import { company } from "@/config/company"
import { useAvatarConversation } from "@/hooks/use-avatar-conversation"
import { useSpeechRecognition, type SpeechRecognitionIssue } from "@/hooks/use-speech-recognition"
import { SCENE_TINT } from "@/lib/scene"
import { useAvatarStore } from "@/stores/avatar.store"

const AvatarStage = dynamic(() => import("@/components/avatar/avatar-stage").then((module) => module.AvatarStage), {
  ssr: false,
})

const NOTICES: Record<Exclude<SpeechRecognitionIssue, null>, string> = {
  unsupported: `Trình duyệt này chưa hỗ trợ nhận dạng giọng nói, Quý khách vui lòng gõ câu hỏi vào ô trên. Dùng Chrome hoặc Edge để nói trực tiếp với ${company.persona.name}.`,
  "permission-denied":
    "Micro đang bị chặn. Bấm biểu tượng ổ khóa cạnh thanh địa chỉ để cho phép micro, hoặc gõ câu hỏi vào ô trên.",
  "no-microphone": "Không tìm thấy micro trên thiết bị này. Quý khách có thể gõ câu hỏi vào ô trên.",
}

export function AvatarExperience(): React.JSX.Element {
  const status = useAvatarStore((state) => state.status)
  const messages = useAvatarStore((state) => state.messages)
  const subtitle = useAvatarStore((state) => state.subtitle)
  const started = useAvatarStore((state) => state.started)
  const engineReady = useAvatarStore((state) => state.engine !== null)
  const loadProgress = useAvatarStore((state) => state.loadProgress)
  const loadError = useAvatarStore((state) => state.loadError)
  const historyOpen = useAvatarStore((state) => state.historyOpen)
  const toggleHistory = useAvatarStore((state) => state.toggleHistory)
  const recommendedTours = useAvatarStore((state) => state.recommendedTours)
  const scene = useAvatarStore((state) => state.scene)
  const setScene = useAvatarStore((state) => state.setScene)

  const { start, ask, interrupt } = useAvatarConversation()

  const handleSpeechError = useCallback((message: string): void => {
    toast.error(message)
  }, [])

  const speech = useSpeechRecognition({
    lang: company.voice.languageCode,
    onFinalTranscript: ask,
    onError: handleSpeechError,
  })

  useEffect(() => {
    const { status: current, setStatus } = useAvatarStore.getState()
    if (speech.listening) setStatus("listening")
    else if (current === "listening") setStatus("idle")
  }, [speech.listening])

  // Nhuộm nền trang theo cảnh đang chọn; CSS lo phần chuyển màu mượt.
  useEffect(() => {
    document.documentElement.style.setProperty("--scene-tint", SCENE_TINT[scene])
  }, [scene])

  // Mascot đổi dáng chờ theo trạng thái: nghiêng đầu nghe khách, ngước lên suy nghĩ.
  useEffect(() => {
    if (!engineReady) return
    const mood = status === "listening" ? "listening" : status === "thinking" ? "thinking" : "idle"
    useAvatarStore.getState().engine?.setMood?.(mood)
  }, [status, engineReady])

  const { listening, cancel: cancelListening, start: startListening, stop: stopListening } = speech

  const handleAsk = useCallback(
    (question: string, image?: string): void => {
      if (listening) cancelListening()
      void ask(question, image)
    },
    [ask, listening, cancelListening],
  )

  const handleMicToggle = useCallback((): void => {
    if (listening) {
      stopListening()
      return
    }
    interrupt()
    useAvatarStore.getState().engine?.lookAtUser(4000)
    startListening()
  }, [interrupt, listening, startListening, stopListening])

  const controlsDisabled = !started || !engineReady
  const notice = !speech.supported ? NOTICES.unsupported : speech.issue ? NOTICES[speech.issue] : null

  const thinking = status === "thinking"

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-dvh flex-col overflow-hidden">
        <SiteHeader />

        <main className="mx-auto grid min-h-0 w-full max-w-[1480px] flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,38fr)_minmax(0,62fr)] gap-3 p-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-1 lg:gap-6 lg:px-5 lg:pt-4 lg:pb-5">
          <section
            aria-label={`Trợ lý ${company.persona.name}`}
            className="animate-reveal min-h-0 rounded-[2rem] bg-ocean/[0.04] p-1.5 ring-1 ring-ocean/10"
          >
            <div className="relative isolate h-full overflow-hidden rounded-[calc(2rem-0.375rem)] bg-linear-to-b from-[#bfe3ff] via-[#e3f2ff] to-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_40px_80px_-40px_rgba(0,70,193,0.55)]">
              <StageScenery scene={scene} />
              {/* Quầng sáng sau lưng mascot, nhuộm theo cảnh để Tripi luôn nổi bật trên nền */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-[10%] top-[18%] bottom-[8%] -z-10 rounded-full bg-[radial-gradient(closest-side,white,transparent)] opacity-70 blur-xl"
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="animate-cloud-drift absolute top-[12%] -left-[10%] h-24 w-[70%] rounded-full bg-white/80 blur-2xl" />
                <div className="animate-cloud-drift absolute top-[30%] -right-[15%] h-20 w-[55%] rounded-full bg-white/60 blur-2xl [animation-delay:-14s] [animation-direction:alternate-reverse]" />
              </div>

              {/* {thinking && (
                <>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-10 animate-pulse rounded-[inherit] ring-2 ring-inset ring-sunset/40"
                  />
                  <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2 overflow-hidden">
                    <div className="animate-shimmer h-full w-full bg-linear-to-r from-transparent via-white/40 to-transparent" />
                  </div>
                </>
              )} */}

              <AvatarStage />

              <div className="absolute top-3 left-3 z-10">
                <StatusBadge status={status} />
              </div>
              <div className="absolute top-3 right-3 z-10">
                <AvatarModelSwitch />
              </div>


              {started && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-white via-white/90 to-transparent px-4 pt-14 pb-4 lg:px-6">
                  {thinking && !subtitle ? (
                    <ThinkingIndicator assistantName={company.persona.name} />
                  ) : (
                    <Subtitle text={subtitle} interim={speech.interimTranscript} />
                  )}
                </div>
              )}
            </div>
          </section>

          <section
            aria-labelledby="assistant-heading"
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
            className="animate-reveal flex min-h-0 flex-col gap-3"
          >
            <div className="hidden shrink-0 lg:block">
              <p className="inline-flex rounded-full bg-sunset/10 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-ocean uppercase">
                Lên kế hoạch chuyến đi
              </p>
              <h1
                id="assistant-heading"
                className="mt-2 text-[2.25rem] leading-[1.05] font-extrabold tracking-[-0.04em] text-ink"
              >
                Bạn muốn <span className="text-ocean">đi đâu</span> trong chuyến tới?
              </h1>
            </div>
            <h1 id="assistant-heading-sm" className="sr-only lg:hidden">
              Lên kế hoạch chuyến đi
            </h1>

            {/* Panel chào phủ lên các ảnh điểm đến để khách thấy ngay mascot và nút bắt đầu cùng lúc */}
            <div className="relative flex min-h-0 flex-1 flex-col">
              <TourCards
                tours={recommendedTours}
                thinking={thinking}
                assistantName={company.persona.name}
                destinations={company.destinations}
                controlsDisabled={controlsDisabled}
                onSelectDestination={handleAsk}
                onPreviewScene={setScene}
                className="min-h-0 flex-1"
              />
              <AnimatePresence>
                {!started && (
                  <StartOverlay
                    key="start"
                    assistantName={company.persona.name}
                    ready={engineReady}
                    progress={loadProgress}
                    error={loadError}
                    onStart={start}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              {/* Khi chưa có tour, các ô điểm đến đã đóng vai gợi ý nên chỉ hiện chip sau lần tư vấn đầu */}
              {(recommendedTours.length > 0 || thinking) && (
                <SuggestedQuestions
                  questions={company.suggestedQuestions}
                  disabled={controlsDisabled}
                  onSelect={handleAsk}
                />
              )}
              <ChatPanel
                messages={messages}
                assistantName={company.persona.name}
                status={status}
                historyOpen={historyOpen}
                disabled={controlsDisabled}
                notice={notice}
                onToggleHistory={toggleHistory}
                onSubmit={handleAsk}
                micButton={
                  <MicButton
                    listening={speech.listening}
                    supported={speech.supported}
                    disabled={controlsDisabled}
                    onToggle={handleMicToggle}
                  />
                }
                className=""
              />
            </div>
          </section>
        </main>
      </div>
    </MotionConfig>
  )
}
