import { motion } from "framer-motion";
import { experiences } from "../constants";
import { Reveal, SectionHeading } from "./ui/Reveal";

const Experience = () => (
  <section id="experience" className="container-site py-20 sm:py-28">
    <SectionHeading index="02" eyebrow="Experience" title="Where I'm" accent="building." />

    <div className="mt-16 space-y-6">
      {experiences.map((exp) => (
        <Reveal key={exp.company}>
          <article className="relative overflow-hidden rounded-3xl border border-line bg-surface">
            <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  {exp.current && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 font-mono text-[0.625rem] uppercase tracking-wider text-ink">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />
                      Current
                    </span>
                  )}
                  <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-muted">{exp.period}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-medium tracking-tight sm:text-4xl">{exp.company}</h3>
                  <p className="mt-2 font-serif text-xl italic text-accent">{exp.role}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {exp.stack.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-lg leading-relaxed text-fg">{exp.summary}</p>
                <ul className="mt-8 divide-y divide-line border-t border-line">
                  {exp.points.map((p, i) => (
                    <motion.li
                      key={i}
                      className="flex gap-5 py-5 text-[0.9375rem] leading-relaxed text-muted"
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.6 }}
                    >
                      <span className="pt-1 font-mono text-[0.6875rem] text-accent">0{i + 1}</span>
                      <span>{p}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  </section>
);

export default Experience;
