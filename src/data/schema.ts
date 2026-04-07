import { z } from 'zod'

/** Base shape for curated seed events; extend as content model grows. */
export const timelineEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
})

export type TimelineEventSchema = z.infer<typeof timelineEventSchema>
