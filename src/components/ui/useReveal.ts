import { useEffect, type RefObject } from "react";

/**
 * Lets everything marked `data-reveal` inside `rootRef` rise into place the first time it is seen (see the
 * `[data-reveal]` rules in globals.css). With reduced motion, or no IntersectionObserver, it is simply shown.
 */
export function useReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((t) => t.setAttribute("data-in", ""));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute("data-in", ""); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [rootRef]);
}
