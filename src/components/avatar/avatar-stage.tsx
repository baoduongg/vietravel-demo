"use client"

import { useEffect, useRef } from "react"

import { company } from "@/config/company"
import { createAvatarEngine, type AvatarEngine } from "@/lib/avatar-engine"
import { createMascotEngine } from "@/lib/mascot-engine"
import { cn } from "@/lib/utils"
import { useAvatarStore } from "@/stores/avatar.store"

interface AvatarStageProps {
  className?: string
}

export function AvatarStage({ className }: AvatarStageProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const host = document.createElement("div")
    host.className = "absolute inset-0"
    container.appendChild(host)

    const { setEngine, setLoadProgress, setLoadError } = useAvatarStore.getState()
    let cancelled = false
    let engine: AvatarEngine | null = null

    setLoadError(null)
    setLoadProgress(0)

    const createEngine = (container: HTMLElement, onProgress: (percent: number) => void): Promise<AvatarEngine> => {
      if (company.avatarModel === "human") return createAvatarEngine(container, onProgress)
      return createMascotEngine(container, onProgress, company.avatarModel === "mascot" ? "glb" : "procedural")
    }
    createEngine(host, (percent: number) => {
      if (!cancelled) setLoadProgress(percent)
    })
      .then((created: AvatarEngine) => {
        if (cancelled) {
          created.dispose()
          return
        }
        engine = created
        setEngine(created)
      })
      .catch((error: unknown) => {
        console.error("[AvatarStage]", error)
        if (!cancelled) setLoadError("Không tải được avatar. Quý khách kiểm tra kết nối mạng rồi tải lại trang nhé.")
      })

    return () => {
      cancelled = true
      engine?.dispose()
      setEngine(null)
      host.remove()
    }
  }, [])

  return <div ref={containerRef} aria-hidden className={cn("absolute inset-0", className)} />
}
