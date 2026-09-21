"use client";
import { useEffect, useRef, type RefObject } from "react";

interface Streak {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tail: number;
  age: number;
  life: number;
}

const HEAD = "233, 246, 255";
const TAIL = "157, 200, 240";

/**
 * Occasional shooting stars across the hero's night sky: a bright head trailing an icy-blue streak.
 * A transparent 2D canvas sits over the galaxy canvas and only draws (and spawns) while the hero is on screen.
 */
export default function ShootingStars({ rootRef }: { rootRef: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !root || !context) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let visible = true;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(root);

    const streaks: Streak[] = [];
    const spawn = () => {
      const small = width < 640;
      const dir = Math.random() < 0.5 ? 1 : -1;
      const angle = ((18 + Math.random() * 22) * Math.PI) / 180;
      const speed = (small ? 620 : 900) + Math.random() * (small ? 320 : 600);
      // Start in the upper part of the sky so the streak has room to fall before it fades.
      streaks.push({
        x: width * (dir > 0 ? Math.random() * 0.7 : 0.3 + Math.random() * 0.7),
        y: height * (0.04 + Math.random() * 0.5),
        vx: Math.cos(angle) * speed * dir,
        vy: Math.sin(angle) * speed,
        tail: (small ? 70 : 110) + Math.random() * (small ? 60 : 130),
        age: 0,
        life: 0.75 + Math.random() * 0.55,
      });
    };

    let nextSpawn = 2.2 + Math.random() * 2;
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (visible) {
        nextSpawn -= dt;
        if (nextSpawn <= 0) {
          spawn();
          // Now and then a second one follows close behind.
          if (Math.random() < 0.22) window.setTimeout(spawn, 160 + Math.random() * 380);
          nextSpawn = 3 + Math.random() * 5;
        }
      }

      context.clearRect(0, 0, width, height);
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.age += dt;
        const p = s.age / s.life;
        if (p >= 1) { streaks.splice(i, 1); continue; }
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        // Quick flare-in, long fade-out; the trail stretches then shortens with it.
        const envelope = p < 0.12 ? p / 0.12 : Math.pow(1 - (p - 0.12) / 0.88, 1.4);
        const length = s.tail * (0.35 + 0.65 * envelope);
        const speed = Math.hypot(s.vx, s.vy);
        const tx = s.x - (s.vx / speed) * length;
        const ty = s.y - (s.vy / speed) * length;

        const gradient = context.createLinearGradient(s.x, s.y, tx, ty);
        gradient.addColorStop(0, `rgba(${HEAD}, ${0.95 * envelope})`);
        gradient.addColorStop(0.35, `rgba(${TAIL}, ${0.4 * envelope})`);
        gradient.addColorStop(1, `rgba(${TAIL}, 0)`);
        context.strokeStyle = gradient;
        context.lineWidth = 1.6;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(s.x, s.y);
        context.lineTo(tx, ty);
        context.stroke();

        const glow = context.createRadialGradient(s.x, s.y, 0, s.x, s.y, 7);
        glow.addColorStop(0, `rgba(255, 255, 255, ${envelope})`);
        glow.addColorStop(0.3, `rgba(${HEAD}, ${0.55 * envelope})`);
        glow.addColorStop(1, `rgba(${HEAD}, 0)`);
        context.fillStyle = glow;
        context.beginPath();
        context.arc(s.x, s.y, 7, 0, Math.PI * 2);
        context.fill();
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [rootRef]);

  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />;
}
