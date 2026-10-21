// Apple's Liquid Glass settings (iOS 27 kit): Refraction 0.7, Depth 30, Dispersion 0.2.
const REFRACTION = 0.7;
const DEPTH = 30;
const DISPERSION = 0.2;
/** Largest shift at the rim, in pixels, for full refraction. */
const MAX_SHIFT = 24;

/** feDisplacementMap scales for the red, green and blue channels: dispersion bends each colour a little differently. */
export const GLASS_SCALES = [1 + DISPERSION / 2, 1, 1 - DISPERSION / 2].map((k) => REFRACTION * MAX_SHIFT * 2 * k);

/** Chromium is the only engine that runs SVG filters in backdrop-filter; elsewhere the glass is blur alone. */
export function supportsRefraction() {
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
  return Boolean(brands?.some(({ brand }) => brand === "Chromium"));
}

/**
 * Displacement map for a capsule `width` × `height`. Near the rim each pixel points inward along the rim's normal, so an
 * feDisplacementMap bends the backdrop at the edges the way a thick glass lens does; the middle is neutral (no shift).
 */
export function capsuleDisplacementMap(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(width, height);
  const radius = height / 2, half = Math.max(0, width / 2 - radius);
  // Depth is how far in from the rim the glass bends light; on a capsule thinner than that, it reaches the middle.
  const band = Math.min(DEPTH, radius);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - width / 2, py = y + 0.5 - height / 2;
      // Offset from the capsule's centre line, so its direction is the rim normal and its length the distance out.
      const vx = px - Math.max(-half, Math.min(half, px)), vy = py;
      const length = Math.hypot(vx, vy) || 1;
      const depth = radius - length;
      const strength = depth < 0 ? 0 : Math.max(0, 1 - depth / band) ** 2;
      const i = (y * width + x) * 4;
      image.data[i] = 128 - (vx / length) * strength * 127;
      image.data[i + 1] = 128 - (vy / length) * strength * 127;
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
