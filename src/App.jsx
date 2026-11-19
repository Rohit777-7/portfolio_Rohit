import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Preloader from "./components/Preloader";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import CommandPalette from "./components/CommandPalette";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Experience from "./components/Experience";
import Works from "./components/Works";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { destroyLenis, initLenis, startScroll, stopScroll } from "./lib/scroll";

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Show the intro once per browser session
const seenIntro = () => {
  try {
    return sessionStorage.getItem("intro-seen") === "1";
  } catch {
    return false;
  }
};

const App = () => {
  const [loading, setLoading] = useState(() => !prefersReduced() && !seenIntro());
  const [ready, setReady] = useState(() => !loading);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef();

  useEffect(() => {
    initLenis();
    return destroyLenis;
  }, []);

  useEffect(() => {
    if (loading) stopScroll();
    else startScroll();
  }, [loading]);

  const onIntroDone = useCallback(() => {
    setReady(true);
    try {
      sessionStorage.setItem("intro-seen", "1");
    } catch {}
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  return (
    <>
      {loading && <Preloader onDone={onIntroDone} />}
      <Cursor />
      <div className="grain" aria-hidden />

      <Navbar onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} onToast={showToast} />

      <main>
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Experience />
        <Works />
        <Contact onToast={showToast} />
      </main>
      <Footer />

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[96] flex justify-center px-4" role="status" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              className="rounded-full bg-fg px-5 py-3 text-sm font-medium text-ink shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default App;
