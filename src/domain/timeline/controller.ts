import { CURATED_TOPIC_IDS } from '../../data/curatedTopics'
import { useAppStore } from '../../store/useAppStore'
import type { TimelineLayoutMode, TopicId } from '../../types'
import type { TimelineShellSnapshot } from './types'

const MODE_KEY = 'mt.shell.timelineMode'
const TOPIC_KEY = 'mt.shell.activeTopicId'

function isLayoutMode(v: string): v is TimelineLayoutMode {
  return v === 'horizontal' || v === 'vertical' || v === 'radial'
}

const TOPIC_IDS = new Set<TopicId>(CURATED_TOPIC_IDS)

function isTopicId(v: string): v is TopicId {
  return TOPIC_IDS.has(v as TopicId)
}

/**
 * Application API beneath the reference shell: persistence, snapshots, future side-effects.
 * Shell UI should call this instead of ad-hoc store writes so motion stays centralized.
 */
export const timelineController = {
  hydrateFromSession(): void {
    if (typeof sessionStorage === 'undefined') return
    const rawMode = sessionStorage.getItem(MODE_KEY)
    if (rawMode && isLayoutMode(rawMode)) {
      useAppStore.setState({ timelineMode: rawMode })
    }
    const rawTopic = sessionStorage.getItem(TOPIC_KEY)
    if (rawTopic && isTopicId(rawTopic)) {
      useAppStore.setState({ activeTopicId: rawTopic })
    } else {
      useAppStore.setState({ activeTopicId: 'sf-giants' })
    }
  },

  setLayoutMode(mode: TimelineLayoutMode): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(MODE_KEY, mode)
    }
    const { setTimelineMode } = useAppStore.getState()
    setTimelineMode(mode)
  },

  selectTopic(id: TopicId | null): void {
    const next = id ?? 'sf-giants'
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(TOPIC_KEY, next)
    }
    useAppStore.getState().setActiveTopicId(next)
  },

  getSnapshot(): TimelineShellSnapshot {
    const { timelineMode, activeTopicId } = useAppStore.getState()
    return { layoutMode: timelineMode, activeTopicId }
  },
}
