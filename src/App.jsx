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
import GuidedTour from "./components/GuidedTour";
import { destroyLenis, initLenis, scrollToId, startScroll, stopScroll } from "./lib/scroll";

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
    // Lets CSS hide floating extras (the AI assistant button) while the intro plays
    document.documentElement.classList.toggle("intro-active", loading);
  }, [loading]);

  const onIntroDone = useCallback(() => {
    setReady(true);
    try {
      sessionStorage.setItem("intro-seen", "1");
    } catch {}
    setTimeout(() => setLoading(false), 1500);
  }, []);

  // Deep links (also used by the AI assistant's voice navigation):
  //   /#tour              → start the guided tour
  //   /#project-<slug>    → scroll to that project card and highlight it
  //   /#about, /#work…    → smooth-scroll to the section
  // The hash is cleared afterwards so asking for the same thing again still works.
  useEffect(() => {
    if (!ready) return;
    const clearHash = () => history.replaceState(null, "", window.location.pathname + window.location.search);
    let pending;
    const handle = () => {
      // Wait a moment so the smooth-scroll library registers the browser's own anchor jump first
      clearTimeout(pending);
      pending = setTimeout(act, 60);
    };
    const act = () => {
      const target = decodeURIComponent(window.location.hash.slice(1));
      if (!target) return;
      if (target === "tour") {
        clearHash();
        window.dispatchEvent(new Event("portfolio:tour"));
      } else if (target.startsWith("project-")) {
        clearHash();
        window.dispatchEvent(new CustomEvent("portfolio:project", { detail: target.slice(8) }));
      } else if (document.getElementById(target)) {
        clearHash();
        scrollToId(target);
      }
    };
    // Let the hero finish appearing before acting on a link the page opened with
    const first = setTimeout(handle, 500);
    window.addEventListener("hashchange", handle);
    return () => {
      clearTimeout(first);
      clearTimeout(pending);
      window.removeEventListener("hashchange", handle);
    };
  }, [ready]);

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
      <GuidedTour />

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
