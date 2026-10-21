"use client";
import { ChalkboardTeacher, GlobeHemisphereEast, HandsClapping, MapTrifold, MicrophoneStage, PresentationChart, RocketLaunch, type Icon } from "@phosphor-icons/react";
import { useRef, useState, type CSSProperties } from "react";
import { useLiquidGlass } from "@/components/ui/liquidGlass";
import StarBackdrop from "@/components/ui/StarBackdrop";
import { useReveal } from "@/components/ui/useReveal";
import { LEADERSHIP, type LeadershipIcon, type LeadershipItem } from "@/data/leadership";
import styles from "./Leadership.module.css";

const ICONS: Record<LeadershipIcon, Icon> = {
  "rocket-launch": RocketLaunch,
  "presentation-chart": PresentationChart,
  "microphone-stage": MicrophoneStage,
  "globe-hemisphere-east": GlobeHemisphereEast,
  "map-trifold": MapTrifold,
  "chalkboard-teacher": ChalkboardTeacher,
  "hands-clapping": HandsClapping,
};

// Where each role's place sits on the chart behind the cards (viewBox 1200 × 600): Italy above the cards, Malaysia
// behind them, Melbourne just below. Not to scale; just the shape of the journey.
const PLACES: Record<string, { x: number; y: number; label: string }> = {
  "Pisa, Italy": { x: 240, y: 170, label: "Pisa" },
  "Monash Prato, Italy": { x: 330, y: 140, label: "Prato" },
  "Kuala Lumpur, Malaysia": { x: 660, y: 300, label: "Kuala Lumpur" },
  "Sunway, Malaysia": { x: 720, y: 336, label: "Sunway" },
  "Melbourne, Australia": { x: 1010, y: 476, label: "Melbourne" },
};
const REGIONS = [
  { x: 170, y: 112, label: "Italy" },
  { x: 610, y: 262, label: "Malaysia" },
  { x: 920, y: 520, label: "Australia" },
];
// The constellation runs home to away: Melbourne, then Malaysia, then Italy.
const ROUTE = ["Melbourne, Australia", "Sunway, Malaysia", "Kuala Lumpur, Malaysia", "Pisa, Italy", "Monash Prato, Italy"].map((location) => PLACES[location]);
const routePath = ROUTE.map((p, i) => {
  if (i === 0) return `M${p.x} ${p.y}`;
  // Each leg bows upward a little, like a flight path on a chart.
  const prev = ROUTE[i - 1];
  return `Q${(prev.x + p.x) / 2} ${Math.min(prev.y, p.y) - 60} ${p.x} ${p.y}`;
}).join(" ");

const pad = (n: number) => String(n).padStart(2, "0");

/** The chart behind the cards: drifting teal and sage glows, a faint graticule, and a star for every place. */
function LeadershipMap({ activeLocation }: { activeLocation: string | null }) {
  return (
    <div className={styles.map} aria-hidden="true">
      <span className={styles.glow} />
      <span className={styles.glow} />
      <span className={styles.glow} />
      <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
        {[120, 260, 400, 540].map((y) => (
          <path key={y} className={styles.graticule} d={`M-20 ${y} Q600 ${y - 60} 1220 ${y}`} />
        ))}
        {[180, 480, 780, 1080].map((x) => (
          <path key={x} className={styles.graticule} d={`M${x} -20 Q${x - 40} 300 ${x} 620`} />
        ))}
        <path className={styles.route} d={routePath} />
        {REGIONS.map((region) => (
          <text key={region.label} className={styles.region} x={region.x} y={region.y}>{region.label}</text>
        ))}
        {Object.entries(PLACES).map(([location, place]) => (
          <g key={location} className={styles.place} data-active={location === activeLocation ? "" : undefined}>
            <circle className={styles.halo} cx={place.x} cy={place.y} r={16} />
            <circle className={styles.dot} cx={place.x} cy={place.y} r={4} />
            <text className={styles.placeLabel} x={place.x + 14} y={place.y - 10}>{place.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** One role on a glass card, always fully shown. Pointing at it lights its place on the chart. */
function LeadershipCard({ item, index, onActive }: { item: LeadershipItem; index: number; onActive: (location: string | null) => void }) {
  const ref = useRef<HTMLElement>(null);
  // The cards hold still, so the glass is pushed past Apple's settings: deeper, stronger bending at the rim with more
  // colour fringing, which shows wherever the chart's lines pass under an edge.
  const glass = useLiquidGlass(ref, 28, { refraction: 1.7, depth: 56, dispersion: 0.35 });
  const Glyph = ICONS[item.icon];
  return (
    <li className={styles.item} data-reveal style={{ "--i": index } as CSSProperties}>
      {glass.filter}
      <article
        ref={ref}
        className={styles.card}
        style={glass.style}
        onPointerEnter={() => onActive(item.location)}
        onPointerLeave={() => onActive(null)}
      >
        <div className={styles.top}>
          <span className={styles.icon}><Glyph size={20} aria-hidden="true" /></span>
          <span className={styles.meta}>{pad(index + 1)}<i aria-hidden="true">·</i>{item.type}</span>
        </div>
        <h3>{item.title}</h3>
        <p className={styles.place}>{item.location}</p>
        <p className={styles.text}>{item.description}</p>
      </article>
    </li>
  );
}

/**
 * Leadership as glass cards laid out over a chart of where each role happened: four across, then three wider ones,
 * with the chart showing between them and through the glass. Everything is on screen at once; nothing scrolls.
 */
export default function Leadership() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  useReveal(sectionRef);

  return (
    <section ref={sectionRef} id="leadership" className={styles.section} aria-labelledby="leadership-title">
      <StarBackdrop />
      <div className={styles.inner}>
        <h2 id="leadership-title" className={styles.head}>
          <b>Leadership</b>
          <span>Community &amp; Impact</span>
        </h2>
      </div>

      <div className={styles.stage}>
        <LeadershipMap activeLocation={activeLocation} />
        <ol className={styles.grid}>
          {LEADERSHIP.map((item, i) => (
            <LeadershipCard key={item.title} item={item} index={i} onActive={setActiveLocation} />
          ))}
        </ol>
      </div>
    </section>
  );
}
