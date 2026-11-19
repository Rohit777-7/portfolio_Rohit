import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { navLinks, profile } from "../constants";
import { scrollToId } from "../lib/scroll";
import Magnetic from "./ui/Magnetic";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

const Navbar = ({ onOpenPalette }) => {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in view
  useEffect(() => {
    const els = navLinks.map((l) => document.getElementById(l.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <motion.div
        className="fixed left-0 right-0 top-0 z-[70] h-[2px] origin-left bg-accent"
        style={{ scaleX: progress }}
      />

      <header className="fixed inset-x-0 top-0 z-50 pt-4">
        <nav
          className={`container-site flex items-center justify-between transition-all duration-500`}
          aria-label="Primary"
        >
          <button
            onClick={() => go("top")}
            className="group flex items-center gap-2.5 text-sm font-medium"
            aria-label="Back to top"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent font-serif text-[15px] italic tracking-tight text-ink transition-transform duration-500 group-hover:rotate-[360deg]">
              RY
            </span>
            <span className="hidden sm:block">{profile.name}</span>
          </button>

          <div
            className={`hidden items-center gap-1 rounded-full border px-1.5 py-1.5 backdrop-blur-xl transition-colors duration-500 md:flex ${
              scrolled ? "border-line bg-ink/70" : "border-transparent bg-transparent"
            }`}
          >
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                  active === l.id ? "text-ink" : "text-muted hover:text-fg"
                }`}
              >
                {active === l.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-fg"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{l.title}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPalette}
              className="hidden items-center gap-2 rounded-full border border-line bg-ink/60 px-3 py-2 text-xs text-muted backdrop-blur-xl transition-colors hover:text-fg sm:flex"
              aria-label="Open command menu"
            >
              <kbd className="font-mono">{isMac ? "⌘" : "Ctrl"}</kbd>
              <kbd className="font-mono">K</kbd>
            </button>
            <Magnetic className="hidden md:inline-block">
              <button onClick={() => go("contact")} className="btn-primary !py-2.5">
                Let's talk
              </button>
            </Magnetic>
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-ink/60 backdrop-blur-xl md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span className="relative block h-3 w-4">
                <span className={`absolute left-0 h-px w-4 bg-fg transition-all duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-4 bg-fg transition-all duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-end bg-ink/95 px-4 pb-10 pt-24 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    onClick={() => go(l.id)}
                    className="flex w-full items-baseline justify-between border-b border-line py-4 text-left text-4xl font-medium tracking-tightest"
                  >
                    {l.title}
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
            <button onClick={() => { setOpen(false); onOpenPalette(); }} className="btn-ghost mt-8 w-full">
              Quick menu
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
