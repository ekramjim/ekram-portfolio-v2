"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import GalaxyOverlay from "./GalaxyOverlay";
import type { GalaxyProps } from "./types";

// three.js is client-only and heavy; keep it out of the server render and initial bundle.
const GalaxyScene = dynamic(() => import("./GalaxyScene"), { ssr: false });

const noop = () => {};

/**
 * Scroll-driven galaxy: starfield loads in, the galaxy forms, then scrolling flies the camera through it.
 * Place it once near the top of a page — it reserves `scrollScreens` viewport heights and clips its own fixed canvas to that zone.
 * Children are laid out after the scroll zone and stay inside the clip, so the galaxy remains behind them as their background.
 */
export default function Galaxy({ scrollScreens = 5, flowSpeed = 0.02, title, children }: GalaxyProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={rootRef}
      // clip-path also clips the scene's position:fixed canvas to this zone, so it never bleeds into later sections.
      style={{ position: "relative", clipPath: "inset(0)" }}
    >
      <GalaxyScene rootRef={rootRef} scrollScreens={scrollScreens} flowSpeed={flowSpeed} title={title} replayToken={0} onPhaseChange={noop} />
      {/* The scroll zone proper: the drag surface only covers this part, so it never sits over the children. */}
      <div style={{ position: "relative", height: `${scrollScreens * 100}vh` }}>
        <GalaxyOverlay title={title.join(" ")} />
      </div>
      {children && <div style={{ position: "relative", zIndex: 3 }}>{children}</div>}
      {/* Fades the end of the zone into the next section's ground. */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "35vh", zIndex: 2, pointerEvents: "none", background: "linear-gradient(to bottom, transparent, var(--space))" }}
      />
    </div>
  );
}
