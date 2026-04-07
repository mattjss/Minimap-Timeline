import { z } from 'zod'

const timelineMediaItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['image', 'video']),
  url: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
})

const timelineFactSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

const timelineSourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().optional(),
})

const timelineRelatedSchema = z.object({
  kind: z.enum(['person', 'place', 'team']),
  label: z.string().min(1),
})

export const timelineEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  year: z.number().int(),
  dateStart: z.string().min(1),
  category: z.string().min(1),
  importance: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  summary: z.string().min(1),
  description: z.string().optional(),
  media: z.array(timelineMediaItemSchema).default([]),
  facts: z.array(timelineFactSchema).default([]),
  sources: z.array(timelineSourceSchema).default([]),
  related: z.array(timelineRelatedSchema).default([]),
})

export type TimelineEventSchema = z.infer<typeof timelineEventSchema>
