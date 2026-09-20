"use client";
import { useEffect, useRef, useState } from "react";

type Dust = {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
};

/**
 * Custom cursor: a small dot that leaves a trail of drifting star-dust,
 * and bursts into a small galaxy explosion of particles on click.
 */
const GalaxyCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const rafRef = useRef<number>(0);
  const mousePos = useRef({ x: 0, y: 0 });
  const lastSpawn = useRef({ x: 0, y: 0 });
  const dustRef = useRef<Dust[]>([]);

  useEffect(() => {
    // Only enable on non-touch devices with fine pointer
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;
    setIsEnabled(true);
    document.documentElement.classList.add("custom-cursor");

    return () => {
      document.documentElement.classList.remove("custom-cursor");
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const cursor = cursorRef.current;
    const canvas = canvasRef.current;
    if (!cursor || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnDust = (x: number, y: number, count: number, spread: number, speed: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * spread;
        const v = (0.3 + Math.random() * 0.7) * speed;
        const maxLife = 0.5 + Math.random() * 0.6;
        dustRef.current.push({
          x: x + Math.cos(angle) * r * 0.2,
          y: y + Math.sin(angle) * r * 0.2,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: maxLife,
          maxLife,
          size: 0.6 + Math.random() * 1.8,
        });
      }
      if (dustRef.current.length > 400) {
        dustRef.current.splice(0, dustRef.current.length - 400);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
      cursor.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;

      const dx = e.clientX - lastSpawn.current.x;
      const dy = e.clientY - lastSpawn.current.y;
      if (dx * dx + dy * dy > 90) {
        lastSpawn.current = { x: e.clientX, y: e.clientY };
        spawnDust(e.clientX, e.clientY, 2, 6, 18);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      // burst — the cursor "explodes" into galaxy dust
      spawnDust(e.clientX, e.clientY, 36, 4, 90);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button'], input, textarea, select, label[for]")) {
        setIsHovering(true);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.relatedTarget as HTMLElement | null;
      if (!target || !target.closest("a, button, [role='button'], input, textarea, select, label[for]")) {
        setIsHovering(false);
      }
    };

    let lastT: number | null = null;
    const animate = (now: number) => {
      const dt = lastT === null ? 0 : Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const dust = dustRef.current;
      for (let i = dust.length - 1; i >= 0; i--) {
        const p = dust[i];
        p.life -= dt;
        if (p.life <= 0) {
          dust.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94;
        p.vy *= 0.94;

        const t = p.life / p.maxLife;
        const alpha = t * 0.85;
        const size = p.size * (0.4 + t * 0.6);

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mousedown", onMouseDown, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseout", onMouseOut, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <>
      {/* Galaxy-dust trail canvas */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.3s ease" }}
      />

      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[10000] pointer-events-none mix-blend-difference will-change-transform"
        style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.15s ease" }}
      >
        <div
          className="rounded-full bg-white transition-all duration-150 ease-out"
          style={{
            width: isHovering ? 22 : 8,
            height: isHovering ? 22 : 8,
          }}
        />
      </div>
    </>
  );
};

export default GalaxyCursor;
