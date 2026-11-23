import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experiences, profile, projects } from "../constants";
import { scrollToId } from "../lib/scroll";

const current = experiences.find((e) => e.current) || experiences[0];

// One stop per section; each caption is shown and read aloud.
const STEPS = [
  {
    id: "top",
    title: "Welcome",
    text: `Hi! I'm Rohit's AI. ${profile.name} is a creative frontend and MERN stack developer who builds web experiences that feel alive.`,
  },
  {
    id: "about",
    title: "About",
    text: `He has ${profile.mernYears}+ years of hands-on MERN experience and builds fast, motion-rich interfaces with React, GSAP and Three.js.`,
  },
  {
    id: "experience",
    title: "Experience",
    text: `Right now he's a ${current.role} at ${current.company}, building cinematic launch websites for real-estate developers.`,
  },
  {
    id: "work",
    title: "Work",
    text: `Here's his work: ${projects.length} live projects, from interactive real-estate launches to Shifra AI, his voice-assistant SaaS.`,
  },
  {
    id: "contact",
    title: "Contact",
    text: "Like what you see? Send a message here or email him. He usually replies within 24 hours.",
  },
];

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

function pickVoice() {
  const voices = synth?.getVoices?.() || [];
  return (
    voices.find((v) => v.lang === "en-IN") ||
    voices.find((v) => /en-(GB|US)/.test(v.lang) && /female|samantha|zira|google/i.test(v.name)) ||
    voices.find((v) => v.lang?.startsWith("en")) ||
    null
  );
}

/**
 * Guided tour of the portfolio. Starts on the "portfolio:tour" event
 * (sent when the page is opened at /#tour, e.g. by the AI assistant).
 */
const GuidedTour = () => {
  const [step, setStep] = useState(-1); // -1 = not running
  const [muted, setMuted] = useState(false);
  const timer = useRef(null);
  const running = step >= 0;

  const stop = useCallback(() => {
    clearTimeout(timer.current);
    synth?.cancel();
    setStep(-1);
  }, []);

  const next = useCallback(() => {
    clearTimeout(timer.current);
    synth?.cancel();
    setStep((s) => (s + 1 < STEPS.length ? s + 1 : -1));
  }, []);

  // Start
  useEffect(() => {
    const start = () => {
      clearTimeout(timer.current);
      synth?.cancel();
      setStep(0);
    };
    window.addEventListener("portfolio:tour", start);
    return () => window.removeEventListener("portfolio:tour", start);
  }, []);

  // Each step: scroll there, speak the caption, then move on
  useEffect(() => {
    if (!running) return;
    const { id, text } = STEPS[step];
    scrollToId(id, id === "top" ? 0 : -90);

    // Fallback timing if speech is unavailable, muted or silent
    const readingMs = Math.max(4200, text.split(" ").length * 330);
    timer.current = setTimeout(next, readingMs + 1800);

    if (synth && !muted) {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) u.voice = voice;
      u.rate = 1.02;
      u.onend = () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(next, 900);
      };
      // Give the scroll a head start before speaking
      const speakTimer = setTimeout(() => synth.speak(u), 450);
      return () => {
        clearTimeout(speakTimer);
        clearTimeout(timer.current);
      };
    }
    return () => clearTimeout(timer.current);
  }, [step, running, muted, next]);

  // Esc stops the tour; stop speech if the page goes away
  useEffect(() => {
    if (!running) return;
    const onKey = (e) => e.key === "Escape" && stop();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, stop]);
  useEffect(() => () => synth?.cancel(), []);

  return (
    <AnimatePresence>
      {running && (
        <motion.div
          className="fixed inset-x-0 bottom-20 z-[80] flex justify-center px-4 sm:bottom-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="Guided tour"
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-accent/30 bg-[#0e0e10]/95 shadow-[0_20px_70px_-20px_rgba(200,255,61,0.4)] backdrop-blur-xl">
            {/* progress */}
            <div className="flex gap-1 px-5 pt-4">
              {STEPS.map((s, i) => (
                <span key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.span
                    className="block h-full bg-accent"
                    initial={false}
                    animate={{ width: i < step ? "100%" : i === step ? "100%" : "0%" }}
                    transition={{ duration: i === step ? 0.6 : 0.3 }}
                  />
                </span>
              ))}
            </div>

            <div className="flex items-start gap-4 px-5 pb-4 pt-3.5">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent font-serif text-sm italic text-ink">
                RY
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">
                  Guided tour · {step + 1}/{STEPS.length} · {STEPS[step].title}
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={step}
                    className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    aria-live="polite"
                  >
                    {STEPS[step].text}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-white/[0.07] px-5 py-3">
              <button
                onClick={() => {
                  setMuted((m) => !m);
                  synth?.cancel();
                }}
                className="inline-flex min-h-[2rem] items-center text-xs text-muted transition-colors hover:text-fg"
              >
                {muted ? "Sound off" : "Sound on"}
              </button>
              <div className="flex gap-2">
                <button onClick={stop} className="rounded-full border border-white/15 px-4 py-2 text-xs text-fg transition-colors hover:border-white/30">
                  Stop
                </button>
                <button onClick={next} className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-ink transition-colors hover:bg-white">
                  {step + 1 < STEPS.length ? "Next →" : "Finish"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GuidedTour;
