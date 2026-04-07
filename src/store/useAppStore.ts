import { create } from 'zustand'
import type { TopicId } from '../types'

type AppState = {
  activeTopicId: TopicId | null
  setActiveTopicId: (id: TopicId | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeTopicId: null,
  setActiveTopicId: (activeTopicId) => set({ activeTopicId }),
}))
