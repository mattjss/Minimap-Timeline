/**
 * Full-viewport atmosphere — deep vignette, timeline stays the focal read.
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
            radial-gradient(ellipse 110% 80% at 48% 36%, color-mix(in oklch, var(--color-accent) 2.2%, transparent), transparent 58%),
            radial-gradient(ellipse 130% 68% at 50% 52%, transparent 38%, rgba(0,0,0,0.28) 100%),
            radial-gradient(ellipse 108% 92% at 50% 108%, rgba(0,0,0,0.52), transparent 58%),
            radial-gradient(ellipse 150% 100% at 50% 50%, color-mix(in oklch, var(--color-ink) 0.8%, transparent), transparent 52%),
            var(--color-canvas)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          background:
            'radial-gradient(ellipse 96% 86% at 50% 48%, transparent 42%, rgba(0,0,0,0.42) 100%)',
        }}
      />
    </div>
  )
}
