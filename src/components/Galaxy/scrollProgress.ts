/** 0 when the root's top is at the viewport top, 1 after `screens` viewport heights of scrolling past it. */
export function getScrollProgress(root: HTMLElement, viewportHeight: number, screens: number) {
  const p = -root.getBoundingClientRect().top / (viewportHeight * screens);
  return Math.max(0, Math.min(1, p));
}
