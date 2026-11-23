import { useEffect, useRef, useState } from "react";
import { useFinePointer, useReducedMotion } from "../lib/hooks";

/**
 * Dot + trailing ring cursor. Hovering any element with `data-cursor="Label"`
 * expands the ring into a pill showing that label; links/buttons grow it slightly.
 */
const Cursor = () => {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  const dot = useRef(null);
  const ring = useRef(null);
  const [label, setLabel] = useState("");
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-cursor");

    const pos = { x: -100, y: -100 };
    const lag = { x: -100, y: -100 };
    let raf;

    const move = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      // Embedded widgets (the AI assistant) sit above the custom cursor's layer,
      // so hand over to the normal system cursor while the pointer is on them.
      // (The widget lives in a Shadow DOM, so events report its host element.)
      if (e.target.closest?.("#shifra-assistant-root, .shifra-popup, .shifra-btn")) {
        setHidden(true);
        return;
      }
      setHidden(false);
      const target = e.target.closest?.("[data-cursor], a, button, [role='button'], input, textarea");
      setLabel(target?.dataset?.cursor || "");
      setHovering(!!target);
    };
    const leave = () => setHidden(true);

    const loop = () => {
      lag.x += (pos.x - lag.x) * 0.18;
      lag.y += (pos.y - lag.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  const size = label ? 88 : hovering ? 52 : 34;

  return (
    <div aria-hidden className={`pointer-events-none fixed inset-0 z-[90] transition-opacity duration-300 ${hidden ? "opacity-0" : "opacity-100"}`}>
      <div ref={ring} className="absolute left-0 top-0">
        <div
          className={`-translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-[width,height,background-color,border-color] duration-300 ease-out ${
            label ? "bg-accent border-transparent" : "border border-white/40"
          }`}
          style={{ width: size, height: size }}
        >
          <span
            className={`font-mono text-[0.625rem] uppercase tracking-wider text-ink transition-opacity duration-200 ${
              label ? "opacity-100" : "opacity-0"
            }`}
          >
            {label}
          </span>
        </div>
      </div>
      <div ref={dot} className="absolute left-0 top-0">
        <div
          className={`h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent transition-opacity ${
            label ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>
    </div>
  );
};

export default Cursor;
