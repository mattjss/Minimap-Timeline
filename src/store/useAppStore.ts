import { create } from 'zustand'
import { getSortedEventsForTopic } from '../data/topicEvents'
import type { TimelineLayoutMode, TopicId } from '../types'

export type EventPreviewPoint = { relX: number; relY: number }

type AppState = {
  activeTopicId: TopicId | null
  setActiveTopicId: (id: TopicId | null) => void
  timelineMode: TimelineLayoutMode
  setTimelineMode: (mode: TimelineLayoutMode) => void
  horizontalHoverEventId: string | null
  setHorizontalHoverEventId: (id: string | null) => void
  horizontalSelectedEventId: string | null
  setHorizontalSelectedEventId: (id: string | null) => void
  /** Position for hover preview, relative to `[data-timeline-stage]`. */
  eventPreviewPoint: EventPreviewPoint | null
  setEventPreviewPoint: (p: EventPreviewPoint | null) => void
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
    const first = firstEventIdForTopic(activeTopicId)
    set({
      activeTopicId,
      horizontalHoverEventId: null,
      eventPreviewPoint: null,
      horizontalSelectedEventId: first,
      eventDetailOpen: false,
    })
  },
  timelineMode: 'horizontal',
  setTimelineMode: (timelineMode) =>
    set({
      timelineMode,
      horizontalHoverEventId: null,
      eventPreviewPoint: null,
      eventDetailOpen: false,
    }),
  horizontalHoverEventId: null,
  setHorizontalHoverEventId: (horizontalHoverEventId) =>
    set({ horizontalHoverEventId }),
  horizontalSelectedEventId: firstEventIdForTopic('sf-giants'),
  setHorizontalSelectedEventId: (horizontalSelectedEventId) =>
    set({ horizontalSelectedEventId }),
  eventPreviewPoint: null,
  setEventPreviewPoint: (eventPreviewPoint) => set({ eventPreviewPoint }),
  eventDetailOpen: false,
  setEventDetailOpen: (eventDetailOpen) => set({ eventDetailOpen }),
  dismissTimelineInteraction: () =>
    set({
      horizontalHoverEventId: null,
      eventPreviewPoint: null,
      horizontalSelectedEventId: null,
      eventDetailOpen: false,
    }),
  openEventDetail: (eventId) =>
    set({
      horizontalSelectedEventId: eventId,
      eventDetailOpen: true,
      horizontalHoverEventId: null,
      eventPreviewPoint: null,
    }),
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
      const i = delta > 0 ? 0 : events.length - 1
      set({
        horizontalSelectedEventId: events[i]!.id,
        eventDetailOpen: false,
        horizontalHoverEventId: null,
        eventPreviewPoint: null,
      })
      return
    }
    const next = Math.min(events.length - 1, Math.max(0, idx + delta))
    set({
      horizontalSelectedEventId: events[next]!.id,
      eventDetailOpen: false,
      horizontalHoverEventId: null,
      eventPreviewPoint: null,
    })
  },
}))
