"use client"

import { useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { ArrowRightIcon, RotateCwIcon } from "lucide-react"
import { toast } from "sonner"

import { AvatarModelSwitch } from "@/components/avatar/avatar-model-switch"
import { ChatPanel } from "@/components/avatar/chat-panel"
import { MicButton } from "@/components/avatar/mic-button"
import { SiteHeader } from "@/components/avatar/site-header"
import { StageScenery } from "@/components/avatar/stage-scenery"
import { StatusBadge } from "@/components/avatar/status-badge"
import { Subtitle } from "@/components/avatar/subtitle"
import { SuggestedQuestions } from "@/components/avatar/suggested-questions"
import { TourCards } from "@/components/avatar/tour-cards"
import { company } from "@/config/company"
import { useAvatarConversation } from "@/hooks/use-avatar-conversation"
import { useSpeechRecognition, type SpeechRecognitionIssue } from "@/hooks/use-speech-recognition"
import { useAvatarStore } from "@/stores/avatar.store"

const AvatarStage = dynamic(
  () => import("@/components/avatar/avatar-stage").then((module) => module.AvatarStage),
  { ssr: false },
)

const NOTICES: Record<Exclude<SpeechRecognitionIssue, null>, string> = {
  unsupported:
    `Trình duyệt này chưa hỗ trợ nhận dạng giọng nói, Quý khách vui lòng gõ câu hỏi vào ô trên. Dùng Chrome hoặc Edge để nói trực tiếp với ${company.persona.name}.`,
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

  const { listening, cancel: cancelListening, start: startListening, stop: stopListening } = speech

  const handleAsk = useCallback(
    (question: string): void => {
      if (listening) cancelListening()
      void ask(question)
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

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-5 px-4 py-5 lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-6 lg:px-6 lg:py-6">
        <section
          aria-label={`Trợ lý ${company.persona.name}`}
          className="animate-reveal flex flex-col rounded-[1.75rem] bg-white p-2 ring-1 ring-cloud lg:min-h-0"
        >
          <div className="relative isolate h-[58dvh] min-h-[380px] overflow-hidden rounded-[1.375rem] bg-linear-to-b from-[#bfe3ff] via-[#e3f2ff] to-white lg:h-auto lg:min-h-0 lg:flex-1">
            <StageScenery />
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              <div className="animate-cloud-drift absolute top-[12%] -left-[10%] h-24 w-[70%] rounded-full bg-white/80 blur-2xl" />
              <div className="animate-cloud-drift absolute top-[30%] -right-[15%] h-20 w-[55%] rounded-full bg-white/60 blur-2xl [animation-delay:-14s] [animation-direction:alternate-reverse]" />
            </div>

            <AvatarStage />

            <div className="absolute top-4 left-4">
              <StatusBadge status={status} />
            </div>

            <div className="absolute top-4 right-4">
              <AvatarModelSwitch />
            </div>

            {!started && (
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-linear-to-t from-white via-white/80 to-transparent px-6 pt-24 pb-8">
                {loadError ? (
                  <>
                    <p role="alert" className="max-w-xs text-center text-sm text-ink">
                      {loadError}
                    </p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-ocean bg-white px-5 text-sm font-bold text-ocean transition-transform duration-300 ease-soft active:scale-[0.97]"
                    >
                      <RotateCwIcon aria-hidden strokeWidth={1.75} className="size-4" />
                      Tải lại trang
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={start}
                      disabled={!engineReady}
                      className="group inline-flex h-14 items-center gap-3 rounded-xl bg-ocean pr-2 pl-6 text-base font-bold text-white shadow-[0_14px_30px_-14px_rgba(0,70,193,0.8)] transition-transform duration-300 ease-soft outline-none hover:bg-[#003a9f] focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:opacity-60"
                    >
                      Trò chuyện với {company.persona.name}
                      <span className="flex size-10 items-center justify-center rounded-lg bg-white/15 transition-transform duration-300 ease-soft group-hover:translate-x-0.5">
                        <ArrowRightIcon aria-hidden strokeWidth={1.75} className="size-5" />
                      </span>
                    </button>
                    <p aria-live="polite" className="text-xs font-semibold text-muted-foreground">
                      {engineReady
                        ? `Bật loa để nghe ${company.persona.name} tư vấn nhé`
                        : `Đang chuẩn bị ${company.persona.name}… ${loadProgress}%`}
                    </p>
                  </>
                )}
              </div>
            )}

            {started && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-white via-white/90 to-transparent px-5 pt-20 pb-6 lg:px-8">
                <Subtitle text={subtitle} interim={speech.interimTranscript} />
              </div>
            )}
          </div>
        </section>

        <section
          aria-labelledby="assistant-heading"
          style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          className="animate-reveal flex min-h-0 flex-col gap-5 rounded-[1.75rem] bg-white p-5 ring-1 ring-cloud lg:p-7"
        >
          <div className="flex flex-col gap-5 lg:min-h-0 lg:shrink-[3] lg:overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              <h1 id="assistant-heading" className="text-2xl leading-tight font-extrabold tracking-tight text-ink lg:text-[2rem]">
                Hỏi {company.persona.name} về chuyến đi của bạn
              </h1>
              <p className="max-w-[60ch] text-[0.95rem] leading-relaxed text-pretty text-muted-foreground">
                Nói điểm đến, thời gian và ngân sách, {company.persona.name} tìm ngay tour {company.brand} đang mở bán.
              </p>
            </div>

            <SuggestedQuestions questions={company.suggestedQuestions} disabled={controlsDisabled} onSelect={handleAsk} />

            <TourCards tours={recommendedTours} assistantName={company.persona.name} />
          </div>

          <ChatPanel
            className="lg:mt-auto"
            messages={messages}
            assistantName={company.persona.name}
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
          />
        </section>
      </main>
    </div>
  )
}
