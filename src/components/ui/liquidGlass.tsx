"use client";
import { Fragment, useEffect, useId, useState, type CSSProperties, type RefObject } from "react";

/** How a piece of glass bends light. The defaults are Apple's Liquid Glass settings (iOS 27 kit). */
export type GlassOptions = {
  /** Strength of the bending; 1 shifts the backdrop by MAX_SHIFT pixels at the rim. Apple: 0.7. */
  refraction?: number;
  /** How far in from the rim the bending reaches, in pixels. Apple: 30. */
  depth?: number;
  /** How differently red, green and blue are bent, which fringes edges with colour. Apple: 0.2. */
  dispersion?: number;
};
/** Largest shift at the rim, in pixels, for full refraction. */
const MAX_SHIFT = 24;

/** feDisplacementMap scales for the red, green and blue channels: dispersion bends each colour a little differently. */
const glassScales = (refraction: number, dispersion: number) =>
  [1 + dispersion / 2, 1, 1 - dispersion / 2].map((k) => refraction * MAX_SHIFT * 2 * k);
// Keeps only the red, green or blue channel (alpha untouched), so each can be bent separately.
const CHANNEL_MATRICES = [0, 1, 2].map((channel) =>
  [0, 1, 2].map((row) => [0, 1, 2, 3, 4].map((column) => (row === channel && column === row ? 1 : 0)).join(" ")).concat("0 0 0 1 0").join(" "),
);

type GlassMap = { width: number; height: number; href: string };

/** Chromium is the only engine that runs SVG filters in backdrop-filter; elsewhere the glass is blur alone. */
function supportsRefraction() {
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
  return Boolean(brands?.some(({ brand }) => brand === "Chromium"));
}

/**
 * Displacement map for a rounded rectangle `width` × `height` with corner `radius` (half the height makes a capsule).
 * Near the rim each pixel points inward along the rim's normal, so an feDisplacementMap bends the backdrop at the
 * edges the way a thick glass lens does; the middle is neutral (no shift).
 */
function glassDisplacementMap(width: number, height: number, radius: number, depth: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(width, height);
  const r = Math.min(radius, width / 2, height / 2);
  // Depth is how far in from the rim the glass bends light; on a shape thinner than that, it reaches the middle.
  const band = Math.min(depth, width / 2, height / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - width / 2, py = y + 0.5 - height / 2;
      // Distance past the inner (corner-less) rectangle on each axis.
      const qx = Math.abs(px) - (width / 2 - r), qy = Math.abs(py) - (height / 2 - r);
      let nx = 0, ny = 0, inset: number;
      if (qx > 0 && qy > 0) {
        const length = Math.hypot(qx, qy);
        nx = (Math.sign(px) * qx) / length;
        ny = (Math.sign(py) * qy) / length;
        inset = r - length;
      } else if (qx > qy) {
        nx = Math.sign(px);
        inset = r - qx;
      } else {
        ny = Math.sign(py);
        inset = r - qy;
      }
      const strength = inset < 0 ? 0 : Math.max(0, 1 - inset / band) ** 2;
      const i = (y * width + x) * 4;
      image.data[i] = 128 - nx * strength * 127;
      image.data[i + 1] = 128 - ny * strength * 127;
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

/**
 * Refraction for one glass element. Returns a `style` that points the element's CSS at its filter (as
 * `--glass-filter`, used in `backdrop-filter: var(--glass-filter,) blur(…)`) and the hidden `<svg>` holding that filter,
 * to render next to the element. The map follows the element's size; outside Chromium both are empty.
 */
export function useLiquidGlass(ref: RefObject<HTMLElement | null>, radius?: number, options: GlassOptions = {}) {
  const { refraction = 0.7, depth = 30, dispersion = 0.2 } = options;
  const id = `glass-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [map, setMap] = useState<GlassMap | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !supportsRefraction()) return;
    const observer = new ResizeObserver(() => {
      const width = Math.round(element.offsetWidth), height = Math.round(element.offsetHeight);
      setMap(width && height ? { width, height, href: glassDisplacementMap(width, height, radius ?? height / 2, depth) } : null);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, radius, depth]);

  const style = map ? ({ "--glass-filter": `url(#${id})` } as CSSProperties) : undefined;
  const filter = map && (
    <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
      <filter id={id} x="0" y="0" width={map.width} height={map.height} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feImage href={map.href} x="0" y="0" width={map.width} height={map.height} preserveAspectRatio="none" result="map" />
        {/* Each colour channel is bent by its own amount, then the three are screened back together. */}
        {glassScales(refraction, dispersion).map((scale, channel) => (
          <Fragment key={channel}>
            <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result={`shift${channel}`} />
            <feColorMatrix in={`shift${channel}`} type="matrix" values={CHANNEL_MATRICES[channel]} result={`channel${channel}`} />
          </Fragment>
        ))}
        <feBlend in="channel0" in2="channel1" mode="screen" result="redGreen" />
        <feBlend in="redGreen" in2="channel2" mode="screen" />
      </filter>
    </svg>
  );
  return { style, filter };
}
