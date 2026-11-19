import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

/** Fades + lifts its children in when scrolled into view. */
export const Reveal = ({ children, delay = 0, y = 28, className = "", as = "div" }) => {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </Tag>
  );
};

/**
 * Splits text into words that slide up from behind a mask.
 * Pass `animate` to trigger immediately (e.g. hero) instead of on scroll.
 */
export const SplitWords = ({ text, className = "", delay = 0, stagger = 0.06, animate }) => {
  const words = text.split(" ");
  const trigger = animate === undefined ? { whileInView: "show", viewport: { once: true, margin: "-10% 0px" } } : { animate: animate ? "show" : "hidden" };

  return (
    <motion.span
      className={className}
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-top">
          <motion.span
            className="inline-block will-change-transform"
            variants={{
              hidden: { y: "110%" },
              show: { y: "0%", transition: { duration: 1, ease } },
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
};

export const SectionHeading = ({ index, eyebrow, title, accent, className = "" }) => (
  <div className={`flex flex-col gap-5 ${className}`}>
    <Reveal className="flex items-center gap-3">
      <span className="font-mono text-[0.6875rem] text-accent">{index}</span>
      <span className="h-px w-10 bg-line" />
      <span className="eyebrow">{eyebrow}</span>
    </Reveal>
    <h2 className="text-[clamp(2.4rem,6vw,5rem)] font-medium leading-[0.95] tracking-tightest">
      <SplitWords text={title} />
      {accent && (
        <>
          {" "}
          <SplitWords text={accent} className="serif-accent text-accent" delay={0.15} />
        </>
      )}
    </h2>
  </div>
);
