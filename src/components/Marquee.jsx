import { stack } from "../constants";

const Row = () => (
  <div className="flex shrink-0 items-center">
    {stack.map((s) => (
      <span key={s} className="flex items-center">
        <span className="whitespace-nowrap px-6 text-[clamp(1.5rem,3.4vw,2.75rem)] font-medium tracking-tightest text-fg/80 transition-colors hover:text-accent">
          {s}
        </span>
        <span className="font-serif text-2xl italic text-accent">✦</span>
      </span>
    ))}
  </div>
);

const Marquee = () => (
  <section aria-label="Tech stack" className="marquee mask-fade-x relative overflow-hidden border-y border-line py-7">
    <div className="marquee-track flex w-max">
      <Row />
      <Row />
    </div>
  </section>
);

export default Marquee;
