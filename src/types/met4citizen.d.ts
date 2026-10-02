declare module "@met4citizen/talkinghead" {
  export type CameraView = "full" | "mid" | "upper" | "head"
  export type AvatarMood = "neutral" | "happy" | "angry" | "sad" | "fear" | "disgust" | "love" | "sleep"

  export interface TalkingHeadOptions {
    ttsEndpoint?: string | null
    lipsyncModules?: string[]
    lipsyncLang?: string
    cameraView?: CameraView
    cameraDistance?: number
    cameraX?: number
    cameraY?: number
    cameraRotateEnable?: boolean
    cameraPanEnable?: boolean
    cameraZoomEnable?: boolean
    mixerGainSpeech?: number | null
    modelFPS?: number
    modelPixelRatio?: number
    avatarMood?: AvatarMood
    avatarIdleEyeContact?: number
    avatarIdleHeadMove?: number
    avatarSpeakingEyeContact?: number
    avatarSpeakingHeadMove?: number
    avatarIgnoreCamera?: boolean
    lightAmbientColor?: number
    lightAmbientIntensity?: number
    lightDirectColor?: number
    lightDirectIntensity?: number
    lightSpotIntensity?: number
    update?: ((dt: number) => void) | null
  }

  export interface AvatarConfig {
    url: string
    body?: "M" | "F"
    avatarMood?: AvatarMood
    lipsyncLang?: string
  }

  export interface SpeakAudioInput {
    audio: AudioBuffer
  }

  export interface SpeakAudioOptions {
    isRaw?: boolean
    lipsyncLang?: string
  }

  export interface MorphTarget {
    newvalue: number | null
    needsUpdate: boolean
  }

  export class TalkingHead {
    constructor(node: HTMLElement, opt?: TalkingHeadOptions)
    audioCtx: AudioContext
    audioSpeechGainNode: GainNode
    audioReverbNode: ConvolverNode
    mtAvatar: Record<string, MorphTarget>
    opt: Required<Pick<TalkingHeadOptions, "update">> & TalkingHeadOptions
    isSpeaking: boolean
    showAvatar(avatar: AvatarConfig, onprogress?: ((event: ProgressEvent) => void) | null): Promise<void>
    speakAudio(r: SpeakAudioInput, opt?: SpeakAudioOptions | null): void
    speakMarker(onmarker: () => void): Promise<void>
    stopSpeaking(): void
    start(): void
    stop(): void
    dispose(): void
    lookAtCamera(t: number): void
    makeEyeContact(t: number): void
    speakWithHands(delay?: number, prob?: number): void
    setMood(mood: AvatarMood): void
  }
}

declare module "@met4citizen/headaudio/dist/headaudio.min.mjs" {
  export interface HeadAudioOptions {
    processorOptions?: Record<string, unknown>
    parameterData?: Record<string, number>
  }

  export class HeadAudio extends AudioWorkletNode {
    constructor(audioCtx: BaseAudioContext, options?: HeadAudioOptions | null)
    onvalue: ((key: string, value: number) => void) | null
    onstarted: ((data: unknown) => void) | null
    onended: ((data: unknown) => void) | null
    loadModel(url: string, reset?: boolean): Promise<void>
    update(dt: number): void
    start(): void
    stop(): void
    resetAll(): void
  }
}
