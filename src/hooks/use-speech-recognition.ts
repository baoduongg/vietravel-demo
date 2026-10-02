"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

export type SpeechRecognitionIssue = "unsupported" | "permission-denied" | "no-microphone" | null

interface UseSpeechRecognitionOptions {
  lang: string
  onFinalTranscript: (transcript: string) => void
  onError: (message: string) => void
}

interface UseSpeechRecognitionResult {
  supported: boolean
  listening: boolean
  interimTranscript: string
  issue: SpeechRecognitionIssue
  start: () => void
  stop: () => void
  cancel: () => void
}

const ERROR_MESSAGES: Partial<Record<SpeechRecognitionErrorCode, string>> = {
  network: "Mất kết nối tới dịch vụ nhận dạng giọng nói. Quý khách thử lại hoặc gõ câu hỏi nhé.",
  "no-speech": "Em chưa nghe thấy gì, Quý khách nói lại giúp em nhé.",
}

const ISSUES: Partial<Record<SpeechRecognitionErrorCode, SpeechRecognitionIssue>> = {
  "not-allowed": "permission-denied",
  "service-not-allowed": "unsupported",
  "language-not-supported": "unsupported",
  "audio-capture": "no-microphone",
}

function getRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined
  return window.SpeechRecognition ?? window.webkitSpeechRecognition
}

const subscribeNoop = (): (() => void) => () => undefined

export function useSpeechRecognition({
  lang,
  onFinalTranscript,
  onError,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionResult {
  const supported = useSyncExternalStore(
    subscribeNoop,
    () => getRecognitionConstructor() !== undefined,
    () => true,
  )
  const [listening, setListening] = useState<boolean>(false)
  const [interimTranscript, setInterimTranscript] = useState<string>("")
  const [issue, setIssue] = useState<SpeechRecognitionIssue>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef<string>("")
  const cancelledRef = useRef<boolean>(false)
  const callbacksRef = useRef({ onFinalTranscript, onError })

  useEffect(() => {
    callbacksRef.current = { onFinalTranscript, onError }
  }, [onFinalTranscript, onError])

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  const start = useCallback((): void => {
    const Recognition = getRecognitionConstructor()
    if (!Recognition) {
      setIssue("unsupported")
      return
    }
    if (recognitionRef.current) return

    const recognition = new Recognition()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    finalTranscriptRef.current = ""
    cancelledRef.current = false

    recognition.onstart = (): void => {
      setIssue(null)
      setListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent): void => {
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const transcript = result[0]?.transcript ?? ""
        if (result.isFinal) finalTranscriptRef.current += `${transcript} `
        else interim += transcript
      }
      setInterimTranscript(`${finalTranscriptRef.current}${interim}`.trim())
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent): void => {
      if (event.error === "aborted") return
      cancelledRef.current = true
      const nextIssue = ISSUES[event.error]
      if (nextIssue) {
        setIssue(nextIssue)
        return
      }
      callbacksRef.current.onError(ERROR_MESSAGES[event.error] ?? "Không nhận dạng được giọng nói, Quý khách thử lại nhé.")
    }

    recognition.onend = (): void => {
      recognitionRef.current = null
      setListening(false)
      setInterimTranscript("")
      const transcript = finalTranscriptRef.current.trim()
      finalTranscriptRef.current = ""
      if (!cancelledRef.current && transcript) callbacksRef.current.onFinalTranscript(transcript)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      recognitionRef.current = null
      callbacksRef.current.onError("Không khởi động được micro, Quý khách thử lại nhé.")
    }
  }, [lang])

  const stop = useCallback((): void => {
    recognitionRef.current?.stop()
  }, [])

  const cancel = useCallback((): void => {
    cancelledRef.current = true
    recognitionRef.current?.abort()
  }, [])

  return {
    supported: supported && issue !== "unsupported",
    listening,
    interimTranscript,
    issue,
    start,
    stop,
    cancel,
  }
}
