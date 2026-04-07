import { useMemo, type CSSProperties } from 'react'
import { topicAccentColor } from '../data/topicCatalog'
import { useAppStore } from '../store/useAppStore'
import type { TopicId } from '../types'

const DEFAULT_TOPIC: TopicId = 'sf-giants'

/**
 * Per-topic accent drives inherited CSS variables for backdrop, links, and chrome.
 */
export function useTopicChromeVars(): CSSProperties {
  const topicId = useAppStore((s) => s.activeTopicId ?? DEFAULT_TOPIC)
  return useMemo(() => {
    const accent = topicAccentColor(topicId)
    return {
      ['--color-accent' as string]: accent,
      ['--color-accent-muted' as string]: `color-mix(in oklch, ${accent} 42%, transparent)`,
    }
  }, [topicId])
}
