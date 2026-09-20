/**
 * Canvas galaxy behind the projects list. Every project is a star on a spiral arm; setActive() flies the camera to one.
 * Plain 2D canvas (no three.js) so it stays cheap next to the hero scene, drawn at device resolution.
 */

export interface SkyProject {
  color: string;
  arm: number;
  t: number;
}

const PALETTE = [[116, 180, 238], [168, 216, 255], [230, 242, 255], [255, 228, 203], [217, 152, 97]];
const LEVELS = [0.3, 0.48, 0.68, 0.95];
const ARMS = 3;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

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

/** World position of a point on a spiral arm; same shape as the hero galaxy. y grows downward, so the tail points up. */
function armPosition(t: number, arm: number, nx: number, ny: number): [number, number] {
  const radius = 18 + 104 * Math.pow(t, 0.94);
  const angle = 1.55 + (1 - t) * 10.2 - arm * (1.15 - 0.25 * t);
  const spread = 1.1 + 4 * Math.sin(t * Math.PI);
  const rad = radius + nx * spread;
  const theta = angle + (ny * spread) / Math.max(radius, 8);
  const tail = 87 * Math.pow(Math.max(0, (t - 0.76) / 0.24), 1.6);
  return [Math.cos(theta) * rad * 1.12, -(Math.sin(theta) * rad + tail)];
}

export function createSky(canvas: HTMLCanvasElement, projects: SkyProject[]) {
  const ctx = canvas.getContext("2d")!;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, DPR = 1;
  let small = false;
  let active = -1;
  let raf = 0;
  let last = 0;
  let clock = 0;
  let flow = 0;
  let snapped = false;

  // --- stars (seeded, so the sky is the same every visit) ---
  let seed = 20240920;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
  const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 1.73;

  const lite = window.innerWidth < 700;
  const perArm = lite ? 2400 : 4200;
  const coreCount = lite ? 420 : 800;
  const armTotal = ARMS * perArm;
  const T0 = new Float32Array(armTotal), ARM = new Uint8Array(armTotal);
  const NX = new Float32Array(armTotal), NY = new Float32Array(armTotal);
  const CX = new Float32Array(coreCount), CY = new Float32Array(coreCount), CS = new Float32Array(coreCount);
  const AX = new Float32Array(armTotal), AY = new Float32Array(armTotal), SIZE = new Float32Array(armTotal);
  const bucketOf = new Uint8Array(armTotal + coreCount);
  const buckets: number[][] = Array.from({ length: PALETTE.length * LEVELS.length }, () => []);
  const hot: number[] = [];
  const knots = Array.from({ length: 110 }, () => rnd());

  for (let i = 0; i < armTotal + coreCount; i++) {
    const isCore = i >= armTotal;
    const pick = rnd();
    const pal = isCore ? 2 : pick < 0.3 ? 0 : pick < 0.55 ? 1 : pick < 0.78 ? 2 : pick < 0.91 ? 3 : 4;
    bucketOf[i] = pal * 4 + Math.min(3, Math.floor(rnd() * 4));
    if (isCore) {
      const k = i - armTotal, r = Math.pow(rnd(), 2.1) * 26, a = rnd() * Math.PI * 2;
      CX[k] = Math.cos(a) * r * 1.05; CY[k] = Math.sin(a) * r; CS[k] = 0.8 + rnd() * 1.2;
      buckets[bucketOf[i]].push(i);
      continue;
    }
    const t = rnd() < 0.72 ? knots[Math.floor(rnd() * knots.length)] + gauss() * 0.012 : rnd();
    T0[i] = Math.max(0, Math.min(0.9999, t));
    ARM[i] = i % ARMS; NX[i] = gauss(); NY[i] = gauss();
    const isHot = rnd() < 0.035;
    SIZE[i] = isHot ? 1.2 : 0.55 + rnd() * 0.85;
    if (isHot) hot.push(i); else buckets[bucketOf[i]].push(i);
  }
  const bucketFill = buckets.map((_, b) => {
    const p = PALETTE[b >> 2];
    return `rgba(${p[0]},${p[1]},${p[2]},${LEVELS[b % 4]})`;
  });
  const field = Array.from({ length: 420 }, () => [rnd(), rnd(), 0.4 + rnd() * 0.7, 0.15 + rnd() * 0.5]);
  const sprites = PALETTE.map((p) => makeSprite(p.join(",")));
  const projectSprites = projects.map((p) => {
    const c = parseInt(p.color.slice(1), 16);
    return makeSprite(`${(c >> 16) & 255},${(c >> 8) & 255},${c & 255}`);
  });

  // --- camera ---
  const cam = { x: 0, y: -40, z: 3, ax: 0, ay: 0 };
  const tgt = { x: 0, y: -40, z: 3, ax: 0, ay: 0 };
  const focus = projects.map(() => 0);
  const world = projects.map(() => [0, 0]);
  const zFit = () => (0.5 * Math.min(W * 1.05, H * 1.15)) / 150;

  function aim() {
    if (active >= 0) {
      tgt.x = world[active][0]; tgt.y = world[active][1]; tgt.z = zFit() * (small ? 2.6 : 3.4);
    } else {
      tgt.x = 0; tgt.y = -40; tgt.z = zFit() * (small ? 0.8 : 0.82);
    }
    tgt.ax = small ? 0.5 * W : 0.88 * W;
    tgt.ay = small ? 0.72 * H : 0.5 * H;
  }

  function draw() {
    const z = cam.z, zr = z / zFit();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    for (const q of field) {
      const sx = (((q[0] * W - cam.x * z * 0.04) % W) + W) % W, sy = (((q[1] * H - cam.y * z * 0.04) % H) + H) % H;
      ctx.fillStyle = `rgba(200,225,255,${q[3]})`;
      ctx.fillRect(sx, sy, q[2], q[2]);
    }

    const ox = cam.ax - cam.x * z, oy = cam.ay - cam.y * z;
    const coreX = ox, coreY = oy, glowR = Math.min(70 * z, 1400);
    const glow = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, glowR);
    glow.addColorStop(0, "rgba(228,240,255,.55)");
    glow.addColorStop(0.15, "rgba(200,222,255,.22)");
    glow.addColorStop(0.5, "rgba(150,185,235,.06)");
    glow.addColorStop(1, "rgba(150,185,235,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(coreX - glowR, coreY - glowR, glowR * 2, glowR * 2);

    // Arm stars ride the spiral inward; the core swirls slowly.
    const sway = reduced ? 0 : Math.sin(clock * 0.08) * 0.035, sc = Math.cos(sway), sn = Math.sin(sway);
    for (let i = 0; i < armTotal; i++) {
      let t = T0[i] - flow; t -= Math.floor(t);
      if (t < 0.03 || t > 0.97) { AX[i] = NaN; continue; }
      const p = armPosition(t, ARM[i], NX[i], NY[i]);
      AX[i] = p[0] * sc - p[1] * sn; AY[i] = p[0] * sn + p[1] * sc;
    }
    const grow = 1 + (0.32 * Math.log(Math.max(1, zr))) / Math.LN2;
    for (let b = 0; b < buckets.length; b++) {
      ctx.fillStyle = bucketFill[b];
      const list = buckets[b];
      for (let n = 0; n < list.length; n++) {
        const id = list[n];
        let px: number, py: number, s: number;
        if (id >= armTotal) {
          const k = id - armTotal;
          const a = (-clock * 0.3) / (1 + Math.hypot(CX[k], CY[k]) / 8);
          const ca = Math.cos(a), sa = Math.sin(a);
          const x0 = CX[k] * ca - CY[k] * sa, y0 = CX[k] * sa + CY[k] * ca;
          px = x0 * sc - y0 * sn; py = x0 * sn + y0 * sc; s = CS[k] * grow;
        } else {
          if (AX[id] !== AX[id]) continue;
          px = AX[id]; py = AY[id]; s = SIZE[id] * grow;
        }
        const X = px * z + ox, Y = py * z + oy;
        if (X < -6 || X > W + 6 || Y < -6 || Y > H + 6) continue;
        ctx.fillRect(X - s / 2, Y - s / 2, s, s);
      }
    }
    for (const id of hot) {
      if (AX[id] !== AX[id]) continue;
      const rr = (9 + (7 * ((id * 7) % 5)) / 4) * Math.sqrt(grow);
      const X = AX[id] * z + ox, Y = AY[id] * z + oy;
      if (X < -rr || X > W + rr || Y < -rr || Y > H + rr) continue;
      ctx.globalAlpha = 0.85;
      ctx.drawImage(sprites[bucketOf[id] >> 2], X - rr, Y - rr, rr * 2, rr * 2);
    }
    ctx.globalAlpha = 1;

    // Project stars
    for (let k = 0; k < projects.length; k++) {
      const X = world[k][0] * z + ox, Y = world[k][1] * z + oy, f = focus[k];
      const rad = 26 + 46 * f;
      ctx.globalAlpha = 0.55 + 0.45 * f;
      ctx.drawImage(projectSprites[k], X - rad, Y - rad, rad * 2, rad * 2);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(X, Y, 2.4 + 2.2 * f, 0, Math.PI * 2); ctx.fill();
      if (f > 0.02) {
        ctx.globalAlpha = f; ctx.strokeStyle = projects[k].color; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(X, Y, 13 + 4 * Math.sin(clock * 2), 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!reduced) { clock += dt; flow = (flow + dt * 0.02) % 1; }
    const sway = reduced ? 0 : Math.sin(clock * 0.08) * 0.035, sc = Math.cos(sway), sn = Math.sin(sway);
    projects.forEach((p, i) => {
      const pos = armPosition(p.t, p.arm, 0, 0);
      world[i][0] = pos[0] * sc - pos[1] * sn; world[i][1] = pos[0] * sn + pos[1] * sc;
    });
    aim();
    if (!snapped) { Object.assign(cam, tgt); snapped = true; }
    const k = reduced ? 1 : 1 - Math.exp(-6 * dt), kf = reduced ? 1 : 1 - Math.exp(-9 * dt);
    cam.x = lerp(cam.x, tgt.x, k); cam.y = lerp(cam.y, tgt.y, k); cam.z = lerp(cam.z, tgt.z, k);
    cam.ax = lerp(cam.ax, tgt.ax, k); cam.ay = lerp(cam.ay, tgt.ay, k);
    for (let i = 0; i < focus.length; i++) focus[i] = lerp(focus[i], i === active ? 1 : 0, kf);
    if (W > 0 && H > 0) draw();
  }

  return {
    setActive(i: number) { active = i; },
    setSmall(value: boolean) { small = value; },
    resize(w: number, h: number) {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = w; H = h;
      canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR);
      snapped = false;
    },
    start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } },
    stop() { cancelAnimationFrame(raf); raf = 0; },
  };
}

export type Sky = ReturnType<typeof createSky>;
