/**
 * Atmospheric depth behind the main canvas — radial washes, no imagery.
 */
export function CanvasBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden
    >
      {/* Base + warm upper halo */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 95% 70% at 50% 42%, color-mix(in oklch, var(--color-ink) 6%, transparent), transparent 55%),
            radial-gradient(ellipse 130% 70% at 50% -15%, color-mix(in oklch, var(--color-accent) 14%, transparent), transparent 58%),
            radial-gradient(ellipse 90% 55% at 72% 38%, color-mix(in oklch, var(--color-ink) 5%, transparent), transparent 50%),
            radial-gradient(ellipse 100% 65% at 50% 115%, rgba(0, 0, 0, 0.55), transparent 52%),
            radial-gradient(circle at 50% 48%, color-mix(in oklch, var(--color-ink) 4%, transparent), transparent 42%),
            var(--color-canvas)
          `,
        }}
      />
      {/* Subtle vignette frame */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          background:
            'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </div>
  )
}
