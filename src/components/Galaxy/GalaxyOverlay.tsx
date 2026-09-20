"use client";

/** Invisible drag surface over the galaxy so it can be rotated with the pointer or arrow keys. */
export default function GalaxyOverlay() {
  return (
    <div style={{ position: "sticky", top: 0, height: "100dvh", width: "100%", overflow: "hidden", zIndex: 1, pointerEvents: "none" }}>
      <button
        type="button"
        data-galaxy-interaction
        aria-label="Rotate galaxy with drag or arrow keys. Press Home to reset."
        className="absolute inset-0 h-full w-full border-0 bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white/60"
        style={{ pointerEvents: "auto", touchAction: "pan-y", cursor: "grab" }}
      />
    </div>
  );
}
