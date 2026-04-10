/**
 * Soft dark field — barely-there top lift so the stage reads like the reference’s open canvas,
 * without heavy product vignettes.
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
            radial-gradient(ellipse 120% 65% at 50% 0%, rgba(255,255,255,0.04), transparent 52%),
            radial-gradient(ellipse 100% 55% at 50% 100%, rgba(0,0,0,0.35), transparent 48%),
            var(--color-canvas)
          `,
        }}
      />
    </div>
  )
}
