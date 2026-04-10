/**
 * Subtle depth on Base Web `backgroundPrimary` (#161616) — timeline contrast comes from
 * dedicated `--color-timeline-*` tokens, not heavy vignettes.
 */
export function CanvasBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% 20%, rgba(255,255,255,0.03), transparent 55%),
            radial-gradient(ellipse 120% 80% at 50% 100%, rgba(0,0,0,0.25), transparent 45%),
            var(--color-canvas)
          `,
        }}
      />
    </div>
  )
}
