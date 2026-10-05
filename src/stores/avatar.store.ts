import { create } from "zustand"

import type { AvatarModel } from "@/config/company"
import { company } from "@/config/company"
import type { AvatarEngine } from "@/lib/avatar-engine"
import type { ChatMessage } from "@/types/chat"
import type { Tour } from "@/types/tour"

export type AvatarStatus = "idle" | "listening" | "thinking" | "speaking"

interface AvatarState {
  avatarModel: AvatarModel
  status: AvatarStatus
  messages: ChatMessage[]
  subtitle: string
  started: boolean
  engine: AvatarEngine | null
  loadProgress: number
  loadError: string | null
  historyOpen: boolean
  recommendedTours: Tour[]
  setAvatarModel: (avatarModel: AvatarModel) => void
  setStatus: (status: AvatarStatus) => void
  addMessage: (message: ChatMessage) => void
  setSubtitle: (subtitle: string) => void
  setStarted: (started: boolean) => void
  setEngine: (engine: AvatarEngine | null) => void
  setLoadProgress: (loadProgress: number) => void
  setLoadError: (loadError: string | null) => void
  toggleHistory: () => void
  setRecommendedTours: (recommendedTours: Tour[]) => void
}

export const useAvatarStore = create<AvatarState>()((set) => ({
  avatarModel: company.avatarModel,
  status: "idle",
  messages: [],
  subtitle: "",
  started: false,
  engine: null,
  loadProgress: 0,
  loadError: null,
  historyOpen: true,
  recommendedTours: [],
  // Đổi model giữa lúc đang trò chuyện phải dựng lại engine, nên reset luôn trạng thái hội thoại.
  setAvatarModel: (avatarModel) =>
    set({ avatarModel, started: false, messages: [], subtitle: "", status: "idle" }),
  setStatus: (status) => set({ status }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setSubtitle: (subtitle) => set({ subtitle }),
  setStarted: (started) => set({ started }),
  setEngine: (engine) => set({ engine }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),
  setLoadError: (loadError) => set({ loadError }),
  toggleHistory: () => set((state) => ({ historyOpen: !state.historyOpen })),
  setRecommendedTours: (recommendedTours) => set({ recommendedTours }),
}))
