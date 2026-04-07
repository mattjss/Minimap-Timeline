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
            radial-gradient(ellipse 95% 72% at 50% 42%, color-mix(in oklch, var(--color-accent) 5.5%, transparent), transparent 52%),
            radial-gradient(ellipse 120% 58% at 50% 48%, transparent 28%, rgba(0,0,0,0.42) 100%),
            radial-gradient(ellipse 100% 85% at 50% 108%, rgba(0,0,0,0.72), transparent 58%),
            radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--color-ink) 2.2%, transparent), transparent 42%),
            var(--color-canvas)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.38]"
        style={{
          background:
            'radial-gradient(ellipse 88% 78% at 50% 48%, transparent 36%, rgba(0,0,0,0.62) 100%)',
        }}
      />
    </div>
  )
}
