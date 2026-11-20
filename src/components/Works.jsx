import { forwardRef, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { projects } from "../constants";
import { useFinePointer } from "../lib/hooks";
import { Reveal, SectionHeading } from "./ui/Reveal";

const filters = [
  { id: "all", label: "All" },
  { id: "client", label: "Client work" },
  { id: "personal", label: "Personal" },
];

/** Screenshot in a browser frame with 3D tilt + scroll parallax. */
const Preview = ({ project }) => {
  const ref = useRef(null);
  const fine = useFinePointer();
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const onMove = (e) => {
    if (!fine) return;
    const r = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 8);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <a
      ref={ref}
      href={project.live}
      target="_blank"
      rel="noreferrer"
      data-cursor="Visit ↗"
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="group block [perspective:1200px]"
      aria-label={`Open ${project.title} live site`}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry }}
        className="relative overflow-hidden rounded-2xl border border-line bg-raised shadow-2xl shadow-black/50 [transform-style:preserve-3d]"
      >
        <div className="flex items-center gap-1.5 border-b border-line bg-surface px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-3 truncate rounded-md bg-white/5 px-3 py-1 font-mono text-[0.625rem] text-muted">
            {project.live.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden">
          <motion.div style={{ y: imgY }} className="absolute inset-x-0 -top-[6%] h-[112%]">
            <img
              src={project.image}
              alt={`${project.title} homepage`}
              width={1440}
              height={900}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
            />
          </motion.div>
          <div
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: `radial-gradient(circle at 30% 20%, ${project.accent}, transparent 60%)` }}
          />
        </div>
      </motion.div>
    </a>
  );
};

const ProjectRow = forwardRef(({ project, index }, ref) => {
  const flip = index % 2 === 1;
  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="grid items-center gap-8 border-t border-line pt-10 short:grid-cols-12 short:gap-8 lg:grid-cols-12 lg:gap-14"
    >
      <div className={`short:col-span-6 lg:col-span-7 ${flip ? "short:order-2 lg:order-2" : ""}`}>
        <Preview project={project} />
      </div>

      <div className={`flex flex-col short:col-span-6 lg:col-span-5 ${flip ? "short:order-1 lg:order-1" : ""}`}>
        <div className="flex items-center justify-between font-mono text-[0.6875rem] uppercase tracking-wider text-muted">
          <span>
            <span className="text-accent">{String(index + 1).padStart(2, "0")}</span> / {project.client}
          </span>
          <span>{project.year}</span>
        </div>

        <h3 className="mt-6 text-[clamp(2rem,4vw,3.25rem)] font-medium leading-none tracking-tightest">
          {project.title}
        </h3>
        <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted">{project.blurb}</p>

        <ul className="mt-6 space-y-2">
          {project.highlights.map((h) => (
            <li key={h} className="flex items-center gap-3 text-sm text-fg">
              <span className="h-px w-4 bg-accent" />
              {h}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={project.live} target="_blank" rel="noreferrer" className="btn-primary group !py-3">
            Live site
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
          </a>
          {project.code && (
            <a href={project.code} target="_blank" rel="noreferrer" className="btn-ghost !py-3">
              Source code
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
});
ProjectRow.displayName = "ProjectRow";

const Works = () => {
  const [filter, setFilter] = useState("all");
  const list = projects.filter((p) => filter === "all" || p.kind === filter);

  return (
    <section id="work" className="container-site py-20 sm:py-28">
      <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
        <SectionHeading index="03" eyebrow="Selected work" title="Things I've" accent="shipped." />
        <Reveal className="flex gap-1 self-start rounded-full border border-line p-1 lg:self-auto" >
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                filter === f.id ? "text-ink" : "text-muted hover:text-fg"
              }`}
              aria-pressed={filter === f.id}
            >
              {filter === f.id && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">
                {f.label}
                <span className="ml-1.5 font-mono text-[0.625rem] opacity-60">
                  {f.id === "all" ? projects.length : projects.filter((p) => p.kind === f.id).length}
                </span>
              </span>
            </button>
          ))}
        </Reveal>
      </div>

      <motion.div layout className="mt-16 space-y-20 sm:space-y-28">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((p, i) => (
            <ProjectRow key={p.slug} project={p} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default Works;
