import { useEffect, type RefObject } from "react";

/**
 * Lets everything marked `data-reveal` inside `rootRef` rise into place the first time it is seen (see the
 * `[data-reveal]` rules in globals.css). With reduced motion, or no IntersectionObserver, it is simply shown.
 * Elements added later (a filter swapping cards in) are picked up too, so they never stay hidden.
 */
export function useReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const animate = "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = animate
      ? new IntersectionObserver((entries) => {
          entries.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute("data-in", ""); io?.unobserve(e.target); } });
        }, { threshold: 0.2 })
      : null;
    const track = (target: HTMLElement) => {
      if (target.hasAttribute("data-in")) return;
      if (io) io.observe(target);
      else target.setAttribute("data-in", "");
    };
    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(track);

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches("[data-reveal]")) track(node);
          node.querySelectorAll<HTMLElement>("[data-reveal]").forEach(track);
        });
      }
    });
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io?.disconnect();
      mo.disconnect();
    };
  }, [rootRef]);
}
