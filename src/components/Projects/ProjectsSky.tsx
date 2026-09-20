"use client";
import { useEffect, useRef } from "react";
import type { Project } from "@/data/projects";
import { createSky, type Sky } from "./sky";
import styles from "./Projects.module.css";

interface ProjectsSkyProps {
  projects: Project[];
  /** Index of the project the camera should fly to, or -1 for the whole galaxy. */
  active: number;
  /** A project is expanded: fly in closer. */
  open: boolean;
  /** Narrow layout: galaxy sits under the list instead of beside it. */
  small: boolean;
}

/** The galaxy canvas behind the list. It fills its parent and only animates while on screen. */
export default function ProjectsSky({ projects, active, open, small }: ProjectsSkyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skyRef = useRef<Sky | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const sky = createSky(canvas, projects);
    skyRef.current = sky;
    const resize = () => sky.resize(parent.clientWidth, parent.clientHeight);
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? sky.start() : sky.stop()));
    visibility.observe(parent);
    return () => {
      sky.stop();
      resizeObserver.disconnect();
      visibility.disconnect();
      skyRef.current = null;
    };
  }, [projects]);

  useEffect(() => { skyRef.current?.setActive(active); }, [active]);
  useEffect(() => { skyRef.current?.setOpen(open); }, [open]);
  useEffect(() => { skyRef.current?.setSmall(small); }, [small]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
