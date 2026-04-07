import { useEffect } from 'react'
import { timelineController } from '../domain/timeline'
import { useAppStore } from '../store/useAppStore'
import type { TimelineLayoutMode } from '../types'

const ORDER: TimelineLayoutMode[] = ['horizontal', 'vertical', 'radial']

/**
 * Mode: `[` / `]` (and 1–3). Giants timelines: arrows step selection; Enter opens detail;
 * Escape closes the event detail layer.
 */
export function useTimelineKeyboard() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.isContentEditable)
      ) {
        return
      }

      const snap = timelineController.getSnapshot()
      const store = useAppStore.getState()

      if (e.key === 'Escape') {
        if (store.eventDetailOpen) {
          store.dismissTimelineInteraction()
          e.preventDefault()
        }
        return
      }

      if (e.key === 'Enter') {
        if (store.eventDetailOpen) return
        const topic = store.activeTopicId
        const giants = topic === 'sf-giants' || topic === null
        const mode = snap.layoutMode
        if (
          giants &&
          store.horizontalSelectedEventId &&
          (mode === 'horizontal' || mode === 'vertical' || mode === 'radial')
        ) {
          store.openEventDetail(store.horizontalSelectedEventId)
          e.preventDefault()
        }
        return
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const topic = useAppStore.getState().activeTopicId
        const giants = topic === 'sf-giants' || topic === null
        const mode = snap.layoutMode
        if (
          giants &&
          (mode === 'horizontal' || mode === 'vertical' || mode === 'radial')
        ) {
          useAppStore
            .getState()
            .stepHorizontalSelection(e.key === 'ArrowLeft' ? -1 : 1)
          e.preventDefault()
        }
        return
      }

      if (e.key === '1') {
        timelineController.setLayoutMode('horizontal')
        e.preventDefault()
        return
      }
      if (e.key === '2') {
        timelineController.setLayoutMode('vertical')
        e.preventDefault()
        return
      }
      if (e.key === '3') {
        timelineController.setLayoutMode('radial')
        e.preventDefault()
        return
      }
      if (e.key === '[') {
        const i = ORDER.indexOf(snap.layoutMode)
        const next = ORDER[(i - 1 + ORDER.length) % ORDER.length]
        timelineController.setLayoutMode(next)
        e.preventDefault()
        return
      }
      if (e.key === ']') {
        const i = ORDER.indexOf(snap.layoutMode)
        const next = ORDER[(i + 1) % ORDER.length]
        timelineController.setLayoutMode(next)
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
