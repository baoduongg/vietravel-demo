"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2Icon, VolumeXIcon, WavesIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function AmbientSound(): React.JSX.Element {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.4)
  const [isSupported, setIsSupported] = useState(true)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const isPlayingRef = useRef(false)

  // Synthetic Ocean Wave Generator using Web Audio API
  const startOceanWaves = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) {
        setIsSupported(false)
        return
      }

      const ctx = audioCtxRef.current || new AudioContextClass()
      audioCtxRef.current = ctx

      if (ctx.state === "suspended") {
        ctx.resume()
      }

      // Buffer size for pink noise
      const bufferSize = 2 * ctx.sampleRate
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
        output[i] *= 0.11 // scale volume down
        b6 = white * 0.115926
      }

      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = noiseBuffer
      whiteNoise.loop = true

      // Filter to shape ocean frequency
      const filter = ctx.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(320, ctx.currentTime)

      // Low frequency oscillator for wave swells (8-second wave period)
      const lfo = ctx.createOscillator()
      lfo.frequency.setValueAtTime(0.125, ctx.currentTime) // 8s per wave

      const lfoGain = ctx.createGain()
      lfoGain.gain.setValueAtTime(350, ctx.currentTime) // frequency modulation range

      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)

      // Main Gain Node
      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(volume, ctx.currentTime)
      gainNodeRef.current = masterGain

      whiteNoise.connect(filter)
      filter.connect(masterGain)
      masterGain.connect(ctx.destination)

      whiteNoise.start(0)
      lfo.start(0)

      isPlayingRef.current = true
      setIsPlaying(true)
    } catch {
      setIsSupported(false)
    }
  }

  const stopOceanWaves = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
      gainNodeRef.current = null
    }
    isPlayingRef.current = false
    setIsPlaying(false)
  }

  const toggleSound = () => {
    if (isPlaying) {
      stopOceanWaves()
    } else {
      startOceanWaves()
    }
  }

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.1)
    }
  }, [volume])

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [])

  if (!isSupported) return <></>

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-500",
        isPlaying
          ? "bg-gradient-to-r from-primary-ink/20 via-primary-ink/10 to-sky/20 border border-primary-ink/40 text-primary-ink shadow-[0_0_20px_rgba(0,70,193,0.3)]"
          : "bg-tint/5 border border-tint/10 text-body hover:bg-tint/10 hover:text-champagne",
      )}
    >
      <button
        type="button"
        onClick={toggleSound}
        className="flex items-center gap-1.5 outline-none focus-visible:ring-1 focus-visible:ring-ring"
        title={isPlaying ? "Tắt âm thanh sóng biển" : "Bật âm thanh sóng biển Phú Quốc"}
        aria-label={isPlaying ? "Tắt âm thanh sóng biển" : "Bật âm thanh sóng biển"}
      >
        <WavesIcon className={cn("size-3.5 transition-transform duration-500", isPlaying && "animate-pulse text-primary-ink scale-110")} />
        <span className="sr-only">{isPlaying ? "Sóng biển Phú Quốc" : "Âm thanh biển"}</span>
        
        {/* Animated Equalizer Bars when playing */}
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-3 px-1">
            <span className="w-0.5 bg-primary-ink rounded-full animate-[wave-bar_1.1s_ease-in-out_infinite]" />
            <span className="w-0.5 bg-accent-sun rounded-full animate-[wave-bar_0.8s_ease-in-out_infinite_0.2s]" />
            <span className="w-0.5 bg-accent-cyan rounded-full animate-[wave-bar_1.4s_ease-in-out_infinite_0.4s]" />
            <span className="w-0.5 bg-primary-ink rounded-full animate-[wave-bar_0.9s_ease-in-out_infinite_0.1s]" />
          </div>
        ) : (
          <Volume2Icon className="size-3 text-muted-foreground" />
        )}
      </button>

      {isPlaying && (
        <button
          type="button"
          onClick={() => setVolume((v) => (v > 0.3 ? 0.2 : 0.6))}
          className="ml-1 text-tint/60 hover:text-tint"
          title="Đổi mức âm lượng"
        >
          {volume > 0.3 ? <Volume2Icon className="size-3" /> : <VolumeXIcon className="size-3" />}
        </button>
      )}
    </div>
  )
}
