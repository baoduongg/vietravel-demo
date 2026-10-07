import type { TalkingHead } from "@met4citizen/talkinghead"
import type { HeadAudio } from "@met4citizen/headaudio/dist/headaudio.min.mjs"

const AVATAR_URL = "/avatars/brunette.glb"
const HEADAUDIO_WORKLET_URL = "/headaudio/headworklet.min.mjs"
const HEADAUDIO_MODEL_URL = "/headaudio/model-en-mixed.bin"
const LIPSYNC_DELAY_SECONDS = 0.1
const GESTURE_PAUSE_MS = 150

export interface AvatarEngine {
  unlock: () => Promise<void>
  speak: (audio: ArrayBuffer) => Promise<void>
  stop: () => void
  lookAtUser: (durationMs: number) => void
  dispose: () => void
}

export async function createAvatarEngine(
  container: HTMLElement,
  onProgress: (percent: number) => void,
): Promise<AvatarEngine> {
  const [{ TalkingHead: TalkingHeadClass }, { HeadAudio: HeadAudioClass }] = await Promise.all([
    import("@met4citizen/talkinghead"),
    import("@met4citizen/headaudio/dist/headaudio.min.mjs"),
  ])

  const head: TalkingHead = new TalkingHeadClass(container, {
    ttsEndpoint: "N/A",
    lipsyncModules: [],
    cameraView: "upper",
    cameraRotateEnable: false,
    mixerGainSpeech: 3,
    avatarMood: "neutral",
    avatarIdleEyeContact: 0.6,
    avatarSpeakingEyeContact: 0.8,
  })

  let headaudio: HeadAudio | null = null

  try {
    await head.showAvatar({ url: AVATAR_URL, body: "F", avatarMood: "neutral" }, (event: ProgressEvent) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    })

    await head.audioCtx.audioWorklet.addModule(HEADAUDIO_WORKLET_URL)
    headaudio = new HeadAudioClass(head.audioCtx, {
      processorOptions: {},
      parameterData: { vadGateActiveDb: -40, vadGateInactiveDb: -60, speakerMeanHz: 220 },
    })
    await headaudio.loadModel(HEADAUDIO_MODEL_URL)
  } catch (error: unknown) {
    headaudio?.disconnect()
    head.dispose()
    void head.audioCtx.close()
    throw error
  }

  const lipsync = headaudio

  // HeadAudio analyses the speech tap with some latency, so the audible path is delayed to keep lips in sync.
  const delayNode = new DelayNode(head.audioCtx, { delayTime: LIPSYNC_DELAY_SECONDS })
  head.audioSpeechGainNode.connect(lipsync)
  head.audioSpeechGainNode.disconnect(head.audioReverbNode)
  head.audioSpeechGainNode.connect(delayNode)
  delayNode.connect(head.audioReverbNode)

  lipsync.onvalue = (key: string, value: number): void => {
    const target = head.mtAvatar[key]
    if (target) Object.assign(target, { newvalue: value, needsUpdate: true })
  }
  head.opt.update = lipsync.update.bind(lipsync)

  let lastEnded = 0
  lipsync.onended = (): void => {
    lastEnded = Date.now()
  }
  lipsync.onstarted = (): void => {
    if (Date.now() - lastEnded > GESTURE_PAUSE_MS) {
      head.lookAtCamera(500)
      head.speakWithHands()
    }
  }

  let speechToken = 0
  let finishCurrent: (() => void) | null = null

  const settle = (): void => {
    const finish = finishCurrent
    finishCurrent = null
    finish?.()
  }

  const stop = (): void => {
    speechToken += 1
    head.stopSpeaking()
    settle()
  }

  return {
    async unlock(): Promise<void> {
      head.start()
      if (head.audioCtx.state === "suspended") {
        await head.audioCtx.resume()
      }
    },

    async speak(audio: ArrayBuffer): Promise<void> {
      stop()
      if (head.audioCtx.state === "suspended") {
        await head.audioCtx.resume()
      }
      const token = speechToken
      const buffer = await head.audioCtx.decodeAudioData(audio.slice(0))
      if (token !== speechToken) return

      await new Promise<void>((resolve) => {
        finishCurrent = resolve
        head.speakAudio({ audio: buffer }, { isRaw: true })
        void head.speakMarker(() => {
          if (token === speechToken) settle()
        })
      })
    },

    stop,

    lookAtUser(durationMs: number): void {
      head.makeEyeContact(durationMs)
    },

    dispose(): void {
      stop()
      lipsync.onvalue = null
      lipsync.onstarted = null
      lipsync.onended = null
      head.opt.update = null
      lipsync.disconnect()
      delayNode.disconnect()
      head.dispose()
      void head.audioCtx.close()
    },
  }
}
