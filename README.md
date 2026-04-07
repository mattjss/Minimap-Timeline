# Minimap Timeline

Repository: [github.com/mattjss/Minimap-Timeline](https://github.com/mattjss/Minimap-Timeline)

**Minimap Timeline** is a premium minimap-based timeline explorer. It pairs an elegant, spatial canvas—horizontal, vertical, and radial minimap views—with rich educational content: summaries, facts, media, sources, and related entities. Interaction and motion are inspired by the timeline variations popularized via channels like **60fps**, originating from **Ibelick**’s work: dark, sparse, floating, and motion-led rather than dense dashboard UI.

Local curated seed data powers the first render; Wikipedia, Wikimedia, and other APIs can enrich events over time. The main canvas stays restrained; detail lives in panels, hovers, previews, and metadata layers.

## Stack

- Vite, React, TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Framer Motion, Zustand, React Router, Zod
- `clsx`, `tailwind-merge`, `lucide-react`

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Product topics (planned)

1. SF Giants history  
2. SF 49ers history  
3. Golden State Warriors history  
4. San Jose Sharks history  
5. Silicon Valley tech history  
6. San Francisco city history  
7. United States history  

## Current status

Foundation only: routing shell, design tokens, and placeholder modules. Timeline logic, data fetching, and full UI are not implemented yet.
