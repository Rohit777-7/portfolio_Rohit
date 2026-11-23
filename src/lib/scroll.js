import Lenis from "lenis";

let lenis = null;

export function initLenis() {
  if (lenis || typeof window === "undefined") return lenis;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  let raf;
  const loop = (time) => {
    lenis.raf(time);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  lenis.__stop = () => cancelAnimationFrame(raf);
  return lenis;
}

export function destroyLenis() {
  if (!lenis) return;
  lenis.__stop?.();
  lenis.destroy();
  lenis = null;
}

export function stopScroll() {
  lenis?.stop();
}

export function startScroll() {
  lenis?.start();
}

/** Scroll to a section id (or "top"), using Lenis when available. */
export function scrollToId(id, offset = -24) {
  if (id === "top") {
    lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  // Absolute position from the real scroll offset, so it stays correct even
  // right after the browser jumped to an anchor on its own.
  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY + offset);
  if (lenis) lenis.scrollTo(top);
  else window.scrollTo({ top, behavior: "smooth" });
}
