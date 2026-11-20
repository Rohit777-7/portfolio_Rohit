import { Suspense, lazy, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { profile, socials } from "../constants";
import { useClock, useMediaQuery, useReducedMotion } from "../lib/hooks";
import { scrollToId } from "../lib/scroll";
import { SplitWords } from "./ui/Reveal";
import Magnetic from "./ui/Magnetic";

const HeroWave = lazy(() => import("./canvas/HeroWave"));

const ease = [0.22, 1, 0.36, 1];

const Hero = ({ ready }) => {
  const reduced = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 768px)");
  const time = useClock(profile.timezone);
  const [showWave, setShowWave] = useState(false);

  // Mount WebGL just after the intro so first paint stays fast
  useEffect(() => {
    if (ready && !reduced) {
      const id = setTimeout(() => setShowWave(true), 200);
      return () => clearTimeout(id);
    }
  }, [ready, reduced]);

  const fade = (delay) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.9, delay, ease },
  });

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* Backdrop: soft aurora glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-[-25%] h-[70vmin] w-[110vmin] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-[140px]" />
        <div className="absolute bottom-[5%] right-[-10%] h-[50vmin] w-[70vmin] rounded-full bg-[#5865ff]/[0.07] blur-[130px]" />
      </div>

      {/* Dot-wave landscape */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 1.6, delay: 0.3, ease }}
        aria-hidden
      >
        {showWave && (
          <Suspense fallback={null}>
            <HeroWave dense={desktop} />
          </Suspense>
        )}
        {/* Keep the headline area clean and blend the wave into the next section */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_28%_45%,rgba(10,10,11,0.6),transparent_65%)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
      </motion.div>

      <div className="container-site relative z-10 flex flex-1 flex-col pb-6 pt-28 sm:pt-32">
        <motion.div {...fade(0.1)} className="flex flex-wrap items-center gap-2.5">
          {profile.available && (
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.08] px-3.5 py-1.5 text-xs font-medium text-accent backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Available for work
            </span>
          )}
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5 text-xs text-muted backdrop-blur">
            {profile.role}
            <span className="h-3 w-px bg-line" />
            <span className="text-fg">{profile.company}</span>
          </span>
        </motion.div>

        <div className="flex flex-1 flex-col justify-center py-6 sm:py-8">
          <motion.p {...fade(0.2)} className="mb-5 font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-muted">
            {profile.name} — Portfolio
          </motion.p>
          <h1 className="text-[clamp(2.9rem,min(8.6vw,13vh),9rem)] font-medium leading-[0.9] tracking-tightest">
            <span className="sr-only">{profile.name}, creative frontend &amp; MERN stack developer: </span>
            <SplitWords text="I build web" animate={ready} delay={0.2} />
            <br />
            <SplitWords text="experiences that" animate={ready} delay={0.32} />
            <br />
            <SplitWords text="feel alive." animate={ready} delay={0.44} className="serif-accent pr-2 text-accent" />
          </h1>
        </div>

        <div className="grid gap-8 border-t border-line pt-7 md:grid-cols-12 md:items-end">
          <motion.p {...fade(0.75)} className="max-w-md text-[0.9375rem] leading-relaxed text-muted md:col-span-5">
            Creative frontend & <span className="text-fg">MERN stack developer</span> with {profile.mernYears}+ years
            of hands-on experience. I turn ideas into fast, motion-rich products, from cinematic real-estate launches
            to real-time apps.
          </motion.p>

          <motion.div {...fade(0.85)} className="hidden gap-10 md:col-span-3 md:flex">
            {profile.heroStats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-medium tracking-tightest">{s.value}</p>
                <p className="mt-1 text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div {...fade(0.95)} className="flex flex-wrap gap-3 md:col-span-4 md:justify-end">
            <Magnetic>
              <button onClick={() => scrollToId("work")} className="btn-primary group" data-cursor="View">
                See my work
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </Magnetic>
            <Magnetic>
              <button onClick={() => scrollToId("contact")} className="btn-ghost backdrop-blur">
                Get in touch
              </button>
            </Magnetic>
          </motion.div>
        </div>

        <motion.div
          {...fade(1.05)}
          className="mt-7 flex items-center justify-between font-mono text-[0.6875rem] uppercase tracking-wider text-muted"
        >
          <span>
            {profile.location} · {time} IST
          </span>
          <button onClick={() => scrollToId("about")} className="-my-2 hidden min-h-[2rem] items-center gap-2 py-2 transition-colors hover:text-fg sm:flex">
            Scroll to explore
            <motion.span animate={reduced ? {} : { y: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
              ↓
            </motion.span>
          </button>
          <span className="flex gap-4">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="-my-2 inline-flex min-h-[2rem] items-center py-2 transition-colors hover:text-fg">
                {s.label} ↗
              </a>
            ))}
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
