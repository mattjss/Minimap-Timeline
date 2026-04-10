import { create } from 'zustand'
import { getSortedEventsForTopic } from '../data/topicEvents'
import type { TimelineLayoutMode, TopicId } from '../types'

const HOVER_CLEAR_MS = 340

let horizontalHoverClearTimer: ReturnType<typeof setTimeout> | null = null

function clearHorizontalHoverLeaveTimer() {
  if (horizontalHoverClearTimer !== null) {
    clearTimeout(horizontalHoverClearTimer)
    horizontalHoverClearTimer = null
  }
}

type AppState = {
  activeTopicId: TopicId | null
  setActiveTopicId: (id: TopicId | null) => void
  timelineMode: TimelineLayoutMode
  setTimelineMode: (mode: TimelineLayoutMode) => void
  horizontalHoverEventId: string | null
  setHorizontalHoverEventId: (id: string | null) => void
  /** After leaving a node or preview, delay clear so the cursor can move onto the hover card. */
  scheduleHorizontalHoverClear: () => void
  cancelHorizontalHoverClear: () => void
  horizontalSelectedEventId: string | null
  setHorizontalSelectedEventId: (id: string | null) => void
  eventDetailOpen: boolean
  setEventDetailOpen: (open: boolean) => void
  /** Clear hover preview, selection, and detail — e.g. stage backdrop. */
  dismissTimelineInteraction: () => void
  /** Select node and open rich detail. */
  openEventDetail: (eventId: string) => void
  stepHorizontalSelection: (delta: -1 | 1) => void
}

function firstEventIdForTopic(topicId: TopicId | null): string | null {
  const events = getSortedEventsForTopic(topicId)
  return events[0]?.id ?? null
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTopicId: 'sf-giants',
  setActiveTopicId: (activeTopicId) => {
    clearHorizontalHoverLeaveTimer()
    const first = firstEventIdForTopic(activeTopicId)
    set({
      activeTopicId,
      horizontalHoverEventId: null,
      horizontalSelectedEventId: first,
      eventDetailOpen: false,
    })
  },
  timelineMode: 'horizontal',
  setTimelineMode: (timelineMode) => {
    clearHorizontalHoverLeaveTimer()
    set({
      timelineMode,
      horizontalHoverEventId: null,
      eventDetailOpen: false,
    })
  },
  horizontalHoverEventId: null,
  setHorizontalHoverEventId: (horizontalHoverEventId) => {
    clearHorizontalHoverLeaveTimer()
    set({ horizontalHoverEventId })
  },
  scheduleHorizontalHoverClear: () => {
    clearHorizontalHoverLeaveTimer()
    horizontalHoverClearTimer = setTimeout(() => {
      set({ horizontalHoverEventId: null })
      horizontalHoverClearTimer = null
    }, HOVER_CLEAR_MS)
  },
  cancelHorizontalHoverClear: () => {
    clearHorizontalHoverLeaveTimer()
  },
  horizontalSelectedEventId: firstEventIdForTopic('sf-giants'),
  setHorizontalSelectedEventId: (horizontalSelectedEventId) =>
    set({ horizontalSelectedEventId }),
  eventDetailOpen: false,
  setEventDetailOpen: (eventDetailOpen) => set({ eventDetailOpen }),
  dismissTimelineInteraction: () => {
    clearHorizontalHoverLeaveTimer()
    set({
      horizontalHoverEventId: null,
      horizontalSelectedEventId: null,
      eventDetailOpen: false,
    })
  },
  openEventDetail: (eventId) => {
    clearHorizontalHoverLeaveTimer()
    set({
      horizontalSelectedEventId: eventId,
      eventDetailOpen: true,
      horizontalHoverEventId: null,
    })
  },
  stepHorizontalSelection: (delta) => {
    const s = get()
    if (
      s.timelineMode !== 'horizontal' &&
      s.timelineMode !== 'vertical' &&
      s.timelineMode !== 'radial'
    ) {
      return
    }
    const events = getSortedEventsForTopic(s.activeTopicId)
    if (events.length === 0) return
    const idx = events.findIndex((e) => e.id === s.horizontalSelectedEventId)
    if (idx < 0) {
      clearHorizontalHoverLeaveTimer()
      const i = delta > 0 ? 0 : events.length - 1
      set({
        horizontalSelectedEventId: events[i]!.id,
        eventDetailOpen: false,
        horizontalHoverEventId: null,
      })
      return
    }
    clearHorizontalHoverLeaveTimer()
    const next = Math.min(events.length - 1, Math.max(0, idx + delta))
    set({
      horizontalSelectedEventId: events[next]!.id,
      eventDetailOpen: false,
      horizontalHoverEventId: null,
    })
  },
}))
