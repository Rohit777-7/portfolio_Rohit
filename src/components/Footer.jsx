import { navLinks, profile, socials } from "../constants";
import { useClock } from "../lib/hooks";
import { scrollToId } from "../lib/scroll";

const Footer = () => {
  const time = useClock(profile.timezone);

  return (
    <footer className="border-t border-line">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <p className="eyebrow mb-3">Local time</p>
          <p className="font-mono text-sm text-fg">
            {time} IST · {profile.location}
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Menu</p>
          <ul className="space-y-1.5 text-sm">
            {navLinks.map((l) => (
              <li key={l.id}>
                <button onClick={() => scrollToId(l.id)} className="text-muted transition-colors hover:text-fg">
                  {l.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Socials</p>
          <ul className="space-y-1.5 text-sm">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="text-muted transition-colors hover:text-fg">
                  {s.label} ↗
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${profile.email}`} className="text-muted transition-colors hover:text-fg">
                Email ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-site overflow-hidden">
        <p
          aria-hidden
          className="select-none whitespace-nowrap text-center text-[15.5vw] font-semibold leading-[0.8] tracking-tightest text-white/[0.04] lg:text-[13.2rem]"
        >
          {profile.firstName.toUpperCase()} YADAV
        </p>
      </div>

      <div className="container-site flex flex-col items-center justify-between gap-3 border-t border-line py-6 font-mono text-[11px] uppercase tracking-wider text-muted sm:flex-row">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Designed & built by me</span>
        <button onClick={() => scrollToId("top")} className="transition-colors hover:text-accent">
          Back to top ↑
        </button>
      </div>
    </footer>
  );
};

export default Footer;
