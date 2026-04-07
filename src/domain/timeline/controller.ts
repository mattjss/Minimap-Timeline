import { useAppStore } from '../../store/useAppStore'
import type { TimelineLayoutMode, TopicId } from '../../types'
import type { TimelineShellSnapshot } from './types'

const MODE_KEY = 'mt.shell.timelineMode'
const TOPIC_KEY = 'mt.shell.activeTopicId'

function isLayoutMode(v: string): v is TimelineLayoutMode {
  return v === 'horizontal' || v === 'vertical' || v === 'radial'
}

const TOPIC_IDS = new Set<TopicId>([
  'sf-giants',
  'sf-49ers',
  'gs-warriors',
  'sj-sharks',
  'sv-tech',
  'sf-city',
  'us-history',
])

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
    if (rawTopic === '' || rawTopic === 'null') {
      useAppStore.setState({ activeTopicId: null })
    } else if (rawTopic && isTopicId(rawTopic)) {
      useAppStore.setState({ activeTopicId: rawTopic })
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
    if (typeof sessionStorage !== 'undefined') {
      if (id === null) sessionStorage.removeItem(TOPIC_KEY)
      else sessionStorage.setItem(TOPIC_KEY, id)
    }
    useAppStore.getState().setActiveTopicId(id)
  },

  getSnapshot(): TimelineShellSnapshot {
    const { timelineMode, activeTopicId } = useAppStore.getState()
    return { layoutMode: timelineMode, activeTopicId }
  },
}
