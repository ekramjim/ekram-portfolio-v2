"use client";
import { useEffect, useRef, useState } from "react";
import { SMOKE_FRAGMENT, SMOKE_VERTEX } from "./smokeShader";

// The smoke is soft, so it renders below screen resolution and is scaled up by the browser.
const RENDER_SCALE = 0.6;
// Where the smoke rests when motion is reduced: a frame that reads like the wallpaper.
const STILL_TIME = 40;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
  return shader;
}

/** Full-bleed animated smoke. Fades in over its CSS fallback once the first frame is drawn. */
export default function SmokeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { antialias: false, depth: false, powerPreference: "low-power" });
    if (!canvas || !gl) return;

    const program = gl.createProgram()!;
    try {
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, SMOKE_VERTEX));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, SMOKE_FRAGMENT));
      gl.linkProgram(program);
    } catch (error) {
      console.error(error);
      return;
    }
    gl.useProgram(program);

    // One triangle that covers the screen.
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uPointer = gl.getUniformLocation(program, "uPointer");
    const uStir = gl.getUniformLocation(program, "uStir");

    // Read the paper colour from the page so the smoke's bottom edge matches the section below exactly.
    const probe = document.createElement("div");
    probe.style.color = "var(--space)";
    document.body.appendChild(probe);
    const [red, green, blue] = (getComputedStyle(probe).color.match(/\d+/g) ?? ["245", "243", "238"]).map(Number);
    probe.remove();
    gl.uniform3f(gl.getUniformLocation(program, "uPaper"), red / 255, green / 255, blue / 255);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2) * RENDER_SCALE;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };

    // The pointer is eased so the swirl trails it, and the stir fades out when it stops moving.
    const target = { x: 0.5, y: 0.5 };
    const pointer = { x: 0.5, y: 0.5 };
    let stir = 0;
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width, y = 1 - (event.clientY - rect.top) / rect.height;
      stir = Math.min(1, stir + Math.hypot(x - target.x, y - target.y) * 6);
      target.x = x; target.y = y;
    };

    const draw = (time: number) => {
      gl.uniform1f(uTime, time);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uStir, stir);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      draw(STILL_TIME);
      setReady(true);
      const redraw = () => { resize(); draw(STILL_TIME); };
      window.addEventListener("resize", redraw);
      return () => { window.removeEventListener("resize", resize); window.removeEventListener("resize", redraw); };
    }

    // Only animate while the hero is on screen.
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(canvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let frame = 0, last = performance.now(), first = true;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible) return;
      const ease = 1 - Math.exp(-dt * 4);
      pointer.x += (target.x - pointer.x) * ease;
      pointer.y += (target.y - pointer.y) * ease;
      stir *= Math.exp(-dt * 0.8);
      draw(STILL_TIME + now / 1000);
      if (first) { first = false; setReady(true); }
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: ready ? 1 : 0, transition: "opacity 1.2s ease-out" }}
    />
  );
}
