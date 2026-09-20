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
 */
export default function Galaxy({ scrollScreens = 5, flowSpeed = 0.02, title }: GalaxyProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={rootRef}
      // clip-path also clips the scene's position:fixed canvas to this zone, so it never bleeds into later sections.
      style={{ position: "relative", height: `${scrollScreens * 100}vh`, clipPath: "inset(0)" }}
    >
      <GalaxyScene rootRef={rootRef} scrollScreens={scrollScreens} flowSpeed={flowSpeed} title={title} replayToken={0} onPhaseChange={noop} />
      <GalaxyOverlay title={title.join(" ")} />
      {/* Fades the end of the hero into the next section's ground. */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "35vh", zIndex: 2, pointerEvents: "none", background: "linear-gradient(to bottom, transparent, var(--space))" }}
      />
    </div>
  );
}
