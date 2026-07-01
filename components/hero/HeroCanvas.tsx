"use client";

/**
 * PLACEHOLDER for the Phase 4 React Three Fiber ambient scene
 * (rose-wreathed neo-classical bust / instrument form).
 *
 * For now it renders a layered CSS "marble glow" so the Hero has depth
 * without pulling in the 3D dependency tree yet. Swap the inner markup for a
 * <Canvas> when R3F is introduced — the surrounding layout stays the same.
 */
export default function HeroCanvas() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Soft golden key light from above */}
      <div className="absolute left-1/2 top-[-20%] h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />
      {/* Rose rim glow, lower right */}
      <div className="absolute bottom-[-10%] right-[-5%] h-[45vh] w-[45vh] rounded-full bg-rose/15 blur-[120px]" />
      {/* Faint vignette to seat the bust-to-be */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--color-obsidian)_85%)]" />
    </div>
  );
}
