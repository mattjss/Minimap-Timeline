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
            radial-gradient(ellipse 98% 76% at 50% 38%, color-mix(in oklch, var(--color-accent) 4.2%, transparent), transparent 55%),
            radial-gradient(ellipse 125% 62% at 50% 50%, transparent 32%, rgba(0,0,0,0.38) 100%),
            radial-gradient(ellipse 105% 88% at 50% 112%, rgba(0,0,0,0.68), transparent 56%),
            radial-gradient(ellipse 140% 100% at 50% 50%, color-mix(in oklch, var(--color-ink) 1.4%, transparent), transparent 48%),
            var(--color-canvas)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.32]"
        style={{
          background:
            'radial-gradient(ellipse 92% 82% at 50% 46%, transparent 38%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </div>
  )
}
