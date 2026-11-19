import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { capabilities, profile, stats } from "../constants";
import { Reveal, SectionHeading } from "./ui/Reveal";

const Counter = ({ value, suffix }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
};

/** Card with a cursor-following spotlight on hover. */
const SpotlightCard = ({ children, className = "" }) => {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--x", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`group relative overflow-hidden rounded-3xl border border-line bg-surface p-7 transition-colors duration-500 hover:border-white/15 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--x) var(--y), rgba(200,255,61,0.09), transparent 45%)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};

const About = () => (
  <section id="about" className="container-site py-20 sm:py-28">
    <SectionHeading index="01" eyebrow="About" title="Design-minded," accent="code-driven." />

    <div className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
      <Reveal>
        <p className="text-[clamp(1.35rem,2.4vw,2rem)] leading-snug tracking-tight text-fg">
          I'm a frontend developer who cares about the <span className="serif-accent text-accent">feel</span> of
          a product as much as how it works: the easing on a transition, the moment a page loads, the way a
          scroll tells a story.
        </p>
      </Reveal>
      <Reveal delay={0.1} className="space-y-5 text-base leading-relaxed text-muted sm:text-lg">
        <p>
          At <span className="text-fg">{profile.company}</span> I build launch websites for real-estate
          developers. They're interactive and cinematic: buyers can pick a floor on an interactive tower,
          walk through a 360° tour, or check their commute on a live map.
        </p>
        <p>
          Before that, I spent <span className="text-fg">2+ years hands-on with the MERN stack</span>,
          building full products end to end. RideFlow, a real-time ride-booking platform, and a Next.js
          bookstore are both live. Lately I'm going deeper into WebGL and scroll-driven animation.
        </p>
      </Reveal>
    </div>

    {/* Stats */}
    <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.08} className="flex flex-col justify-between gap-6 bg-ink p-6 sm:p-8">
          <span className="text-[clamp(2.75rem,5.5vw,4.75rem)] font-medium leading-none tracking-tightest">
            <Counter value={s.value} suffix={s.suffix} />
          </span>
          <span className="max-w-[20ch] text-sm text-muted">{s.label}</span>
        </Reveal>
      ))}
    </div>

    {/* Bento: what I do. A 3-column grid where cards 1 and 4 span two columns, so both rows fill exactly */}
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {capabilities.map((c, i) => (
        <Reveal key={c.title} delay={i * 0.08} className={i === 0 || i === 3 ? "lg:col-span-2" : ""}>
          <SpotlightCard className="flex h-full min-h-[240px] flex-col">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-accent">0{i + 1}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full border border-line text-sm text-muted transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:text-accent">
                ↗
              </span>
            </div>
            <h3 className="mt-auto pt-10 text-2xl font-medium tracking-tight">{c.title}</h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{c.body}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {c.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  </section>
);

export default About;
