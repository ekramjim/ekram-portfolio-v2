/**
 * Star field behind the projects list. Each project is a brighter star among ordinary ones; setActive() flies the
 * camera to it and setOpen() takes it in closer. Plain 2D canvas, drawn at device resolution.
 *
 * Two kinds of stars give the field depth: far layers tile the screen and barely move with the camera, and the near
 * layer lives in the same sky as the project stars, so it sweeps past as the camera flies.
 */

export interface SkyProject {
  color: string;
  x: number;
  y: number;
}

const PALETTE = [[116, 180, 238], [168, 216, 255], [230, 242, 255], [255, 228, 203], [217, 152, 97]];
const LEVELS = [0.3, 0.48, 0.68, 0.95];
const FAR_DEPTHS = [0.14, 0.3, 0.52];
/** The near layer covers this many sky units either side of the centre. */
const NEAR_HALF_WIDTH = 720;
const NEAR_HALF_HEIGHT = 470;

interface Spring { value: number; velocity: number }

/** Critically damped spring (no overshoot): eases in and out, and stays smooth when the target changes mid-flight. */
function damp(s: Spring, target: number, smoothTime: number, dt: number) {
  const omega = 2 / smoothTime, x = omega * dt;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = s.value - target;
  const temp = (s.velocity + omega * change) * dt;
  s.velocity = (s.velocity - omega * temp) * decay;
  s.value = target + (change + temp) * decay;
}

function makeSprite(rgb: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.08, `rgba(${rgb},.9)`);
  gr.addColorStop(0.3, `rgba(${rgb},.28)`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  return c;
}

export function createSky(canvas: HTMLCanvasElement, projects: SkyProject[]) {
  const ctx = canvas.getContext("2d")!;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, DPR = 1;
  let small = false;
  let active = -1;
  let wanted = -1;
  let release = 0;
  let open = false;
  let dip = 0;
  let raf = 0;
  let last = 0;
  let clock = 0;
  let snapped = false;

  // --- stars (seeded, so the sky is the same every visit) ---
  let seed = 20240920;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
  const pickBucket = () => {
    const pick = rnd();
    const pal = pick < 0.3 ? 0 : pick < 0.55 ? 1 : pick < 0.78 ? 2 : pick < 0.91 ? 3 : 4;
    return pal * 4 + Math.min(3, Math.floor(rnd() * 4));
  };

  const lite = window.innerWidth < 700;
  const farCount = lite ? 1100 : 2400;
  const nearCount = lite ? 3600 : 8000;

  const U = new Float32Array(farCount), V = new Float32Array(farCount), DEPTH = new Float32Array(farCount);
  const FAR_SIZE = new Float32Array(farCount), FAR_BUCKET = new Uint8Array(farCount);
  for (let i = 0; i < farCount; i++) {
    U[i] = rnd(); V[i] = rnd();
    DEPTH[i] = FAR_DEPTHS[i % FAR_DEPTHS.length];
    FAR_SIZE[i] = 0.5 + DEPTH[i] * 1.1 * rnd();
    FAR_BUCKET[i] = pickBucket();
  }

  const NX = new Float32Array(nearCount), NY = new Float32Array(nearCount), NEAR_SIZE = new Float32Array(nearCount);
  const NEAR_BUCKET = new Uint8Array(nearCount);
  const hot: number[] = [];
  for (let i = 0; i < nearCount; i++) {
    NX[i] = (rnd() * 2 - 1) * NEAR_HALF_WIDTH;
    NY[i] = (rnd() * 2 - 1) * NEAR_HALF_HEIGHT;
    NEAR_BUCKET[i] = pickBucket();
    const isHot = rnd() < 0.03;
    NEAR_SIZE[i] = isHot ? 1.2 : 0.6 + rnd() * 1.0;
    if (isHot) hot.push(i);
  }
  const bucketFill = Array.from({ length: PALETTE.length * LEVELS.length }, (_, b) => {
    const p = PALETTE[b >> 2];
    return `rgba(${p[0]},${p[1]},${p[2]},${LEVELS[b % 4]})`;
  });
  const sprites = PALETTE.map((p) => makeSprite(p.join(",")));
  const projectSprites = projects.map((p) => {
    const c = parseInt(p.color.slice(1), 16);
    return makeSprite(`${(c >> 16) & 255},${(c >> 8) & 255},${c & 255}`);
  });

  // --- camera ---
  const cam = { x: 0, y: 0, z: 3, ax: 0, ay: 0 };
  const tgt = { x: 0, y: 0, z: 3, ax: 0, ay: 0 };
  const spring = (value: number): Spring => ({ value, velocity: 0 });
  // Position and anchor move linearly; zoom is sprung in log space so a zoom feels even from start to finish.
  const sp = { x: spring(0), y: spring(0), z: spring(0), ax: spring(0), ay: spring(0) };
  const focus = projects.map(() => spring(0));
  /** Pixels per sky unit in the overview. */
  const zBase = () => (small ? W / 300 : Math.min(W, H * 1.6) / 560);

  function aim() {
    if (active >= 0) {
      // Open sits the star left of centre; travelling between stars briefly pulls the camera back.
      const pull = dip > 0 ? 1 - 0.4 * Math.sin(Math.PI * (1 - dip)) : 1;
      tgt.x = projects[active].x; tgt.y = projects[active].y;
      tgt.z = zBase() * (open ? (small ? 3.4 : 4.4) * pull : small ? 1.9 : 2.3);
    } else {
      tgt.x = 0; tgt.y = 0; tgt.z = zBase();
    }
    // Hovering a star moves it to the right edge, clear of the preview column that sits beside the list.
    tgt.ax = (open ? (small ? 0.5 : 0.14) : small ? 0.5 : active >= 0 ? 0.88 : 0.68) * W;
    tgt.ay = (open ? (small ? 0.2 : 0.5) : small ? 0.72 : 0.5) * H;
  }

  function draw() {
    const z = cam.z, zRef = zBase(), zr = z / zRef;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    // Far layers: tile the screen, shift a little with the camera and drift slowly.
    const growFar = 1 + (0.12 * Math.log(Math.max(1, zr))) / Math.LN2;
    for (let i = 0; i < farCount; i++) {
      const d = DEPTH[i];
      const sx = (((U[i] * W - (cam.x * zRef - (cam.ax - W * 0.5)) * d + clock * 3 * d) % W) + W) % W;
      const sy = (((V[i] * H - (cam.y * zRef - (cam.ay - H * 0.5)) * d) % H) + H) % H;
      ctx.fillStyle = bucketFill[FAR_BUCKET[i]];
      const s = FAR_SIZE[i] * growFar;
      ctx.fillRect(sx, sy, s, s);
    }

    // Near layer: the same sky as the project stars.
    const ox = cam.ax - cam.x * z, oy = cam.ay - cam.y * z;
    const grow = 1 + (0.32 * Math.log(Math.max(1, zr))) / Math.LN2;
    for (let i = 0; i < nearCount; i++) {
      const X = NX[i] * z + ox, Y = NY[i] * z + oy;
      if (X < -6 || X > W + 6 || Y < -6 || Y > H + 6) continue;
      ctx.fillStyle = bucketFill[NEAR_BUCKET[i]];
      const s = NEAR_SIZE[i] * grow;
      ctx.fillRect(X - s / 2, Y - s / 2, s, s);
    }
    for (const id of hot) {
      const rr = (9 + (7 * ((id * 7) % 5)) / 4) * Math.sqrt(grow);
      const X = NX[id] * z + ox, Y = NY[id] * z + oy;
      if (X < -rr || X > W + rr || Y < -rr || Y > H + rr) continue;
      ctx.globalAlpha = 0.85;
      ctx.drawImage(sprites[NEAR_BUCKET[id] >> 2], X - rr, Y - rr, rr * 2, rr * 2);
    }
    ctx.globalAlpha = 1;

    // Project stars: understated until focused, then the glow swells. No ring.
    for (let k = 0; k < projects.length; k++) {
      const X = projects[k].x * z + ox, Y = projects[k].y * z + oy, f = focus[k].value;
      const rad = 22 + 44 * f;
      ctx.globalAlpha = 0.4 + 0.6 * f;
      ctx.drawImage(projectSprites[k], X - rad, Y - rad, rad * 2, rad * 2);
      ctx.globalAlpha = 0.65 + 0.35 * f;
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(X, Y, 1.9 + 2.3 * f, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!reduced) clock += dt;
    dip = Math.max(0, dip - dt / 0.9);
    // Leaving a star waits a beat before the camera returns to the overview, so moving from one star to the next is one
    // smooth flight instead of out-and-back.
    if (wanted < 0 && active >= 0) { release += dt; if (release > 0.16) active = -1; }
    aim();
    if (!snapped) {
      sp.x.value = tgt.x; sp.y.value = tgt.y; sp.z.value = Math.log(tgt.z); sp.ax.value = tgt.ax; sp.ay.value = tgt.ay;
      snapped = true;
    }
    if (reduced) {
      sp.x.value = tgt.x; sp.y.value = tgt.y; sp.z.value = Math.log(tgt.z); sp.ax.value = tgt.ax; sp.ay.value = tgt.ay;
      focus.forEach((f, i) => { f.value = i === active ? 1 : 0; });
    } else {
      const flight = 0.6;
      damp(sp.x, tgt.x, flight, dt); damp(sp.y, tgt.y, flight, dt); damp(sp.z, Math.log(tgt.z), flight, dt);
      damp(sp.ax, tgt.ax, flight, dt); damp(sp.ay, tgt.ay, flight, dt);
      focus.forEach((f, i) => damp(f, i === active ? 1 : 0, 0.28, dt));
    }
    cam.x = sp.x.value; cam.y = sp.y.value; cam.z = Math.exp(sp.z.value); cam.ax = sp.ax.value; cam.ay = sp.ay.value;
    if (W > 0 && H > 0) draw();
  }

  return {
    setActive(i: number) {
      wanted = i;
      if (i < 0) return; // the camera lets go after a short delay (see tick)
      if (open && i !== active && active >= 0) dip = 1;
      active = i;
      release = 0;
    },
    setOpen(value: boolean) { open = value; },
    setSmall(value: boolean) { small = value; },
    resize(w: number, h: number) {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      if (!W) snapped = false; // only the first size snaps the camera; later resizes keep any fly-in in progress
      W = w; H = h;
      canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR);
    },
    start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } },
    stop() { cancelAnimationFrame(raf); raf = 0; },
  };
}

export type Sky = ReturnType<typeof createSky>;
