import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { profile, socials } from "../constants";
import { useClock, useReducedMotion } from "../lib/hooks";
import { Reveal, SplitWords } from "./ui/Reveal";
import Magnetic from "./ui/Magnetic";

const SERVICE = import.meta.env.VITE_APP_EMAILJS_SERVICE_ID;
const TEMPLATE = import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY;
const emailReady = Boolean(SERVICE && TEMPLATE && PUBLIC_KEY);

const topics = ["Project", "Full-time role", "Freelance", "Just saying hi"];

// ── Small inline icons ───────────────────────────────────────
const Icon = ({ d, className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    {d}
  </svg>
);
const MailIcon = (p) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>} />;
const CopyIcon = (p) => <Icon {...p} d={<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>} />;
const ClockIcon = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>} />;
const ArrowIcon = (p) => <Icon {...p} d={<path d="M7 17 17 7M9 7h8v8" />} />;
const LinkedinIcon = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);
const GithubIcon = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  </svg>
);

const SUBJECTS = ["Let's build something great", "New project idea", "Full-time frontend role", "Freelance collaboration", "Just saying hi"];

/** A tiny mail-compose window; the subject line types itself and cycles. */
const ComposePreview = () => {
  const reduced = useReducedMotion();
  const [text, setText] = useState(reduced ? SUBJECTS[0] : "");

  useEffect(() => {
    if (reduced) return;
    let i = 0;
    let n = 0;
    let deleting = false;
    let timer;
    const tick = () => {
      const word = SUBJECTS[i];
      if (!deleting) {
        n += 1;
        setText(word.slice(0, n));
        if (n === word.length) {
          deleting = true;
          timer = setTimeout(tick, 1800);
          return;
        }
        timer = setTimeout(tick, 45 + Math.random() * 45);
      } else {
        n -= 1;
        setText(word.slice(0, n));
        if (n === 0) {
          deleting = false;
          i = (i + 1) % SUBJECTS.length;
          timer = setTimeout(tick, 350);
          return;
        }
        timer = setTimeout(tick, 22);
      }
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [reduced]);

  return (
    <span className="block overflow-hidden rounded-xl border border-white/10 bg-black/30 font-mono text-[0.75rem]">
      <span className="flex items-center gap-1.5 border-b border-white/[0.07] px-3.5 py-2.5">
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-accent/70" />
        <span className="ml-2 text-[0.625rem] uppercase tracking-[0.18em] text-white/35">New message</span>
      </span>
      <span className="flex gap-3 border-b border-white/[0.07] px-3.5 py-2.5">
        <span className="w-14 shrink-0 text-white/35">To</span>
        <span className="truncate text-fg/90">{profile.name}</span>
      </span>
      <span className="flex gap-3 px-3.5 py-2.5">
        <span className="w-14 shrink-0 text-white/35">Subject</span>
        <span className="truncate text-accent">
          {text}
          <span className="ml-px inline-block h-[1.05em] w-[2px] translate-y-[2px] animate-pulse bg-accent align-baseline" />
        </span>
      </span>
    </span>
  );
};

/** Card with a soft lime spotlight that follows the cursor. */
const GlowCard = ({ as: Tag = "div", className = "", innerClassName = "block", children, ...props }) => {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--x", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <Tag
      ref={ref}
      onMouseMove={onMove}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-colors duration-500 hover:border-accent/40 ${className}`}
      {...props}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(360px circle at var(--x) var(--y), rgba(200,255,61,0.12), transparent 50%)" }}
      />
      <span className={`relative ${innerClassName}`}>{children}</span>
    </Tag>
  );
};

const Field = ({ label, as = "input", className = "", wrapClassName = "block", ...props }) => {
  const Tag = as;
  return (
    <label className={`group ${wrapClassName}`}>
      <span className="mb-2 block font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-white/50 transition-colors group-focus-within:text-accent">
        {label}
      </span>
      <Tag
        {...props}
        className={`w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[0.9375rem] text-fg outline-none transition-all duration-300 placeholder:text-white/30 hover:border-white/20 focus:border-accent/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(200,255,61,0.08),0_0_30px_-8px_rgba(200,255,61,0.35)] ${className}`}
      />
    </label>
  );
};

const Contact = ({ onToast }) => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [topic, setTopic] = useState(topics[0]);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorText, setErrorText] = useState("");
  const time = useClock(profile.timezone);
  const github = socials.find((s) => s.label === "GitHub");
  const others = socials.filter((s) => s.label !== "GitHub");

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      onToast?.("Email copied to clipboard");
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      onToast?.("Please fill in all three fields");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      onToast?.("Please enter a valid email address");
      return;
    }
    // Bots fill the hidden honeypot field; humans never see it
    if (e.currentTarget.elements.namedItem("_honey")?.value) return;

    setStatus("sending");
    setErrorText("");
    try {
      if (emailReady) {
        await emailjs.send(
          SERVICE,
          TEMPLATE,
          {
            from_name: form.name,
            to_name: profile.name,
            from_email: form.email,
            to_email: profile.email,
            message: `[${topic}] ${form.message}`,
          },
          PUBLIC_KEY
        );
      } else {
        // FormSubmit delivers the message straight to the inbox, no account needed
        const res = await fetch(`https://formsubmit.co/ajax/${profile.email}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            _subject: `${topic} · New message from ${form.name.trim()}`,
            _template: "table",
            _replyto: form.email.trim(),
            Topic: topic,
            Name: form.name.trim(),
            Email: form.email.trim(),
            Message: form.message.trim(),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || String(data.success) !== "true") {
          throw new Error(data.message || `Request failed (${res.status})`);
        }
      }
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      const msg = String(err?.message || "");
      // First ever submission: FormSubmit emails the owner an "Activate Form" link
      setErrorText(/activat/i.test(msg) ? "The form is being activated. Please try again in a few minutes." : "");
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden border-t border-line">
      {/* Backdrop: lime glow, a second cool glow and a faint dot grid */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute bottom-[-30%] right-[-10%] h-[700px] w-[900px] rounded-full bg-accent/[0.13] blur-[150px]" />
        <div className="absolute left-[-15%] top-[30%] h-[500px] w-[600px] rounded-full bg-[#5865ff]/[0.08] blur-[140px]" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 70% 60% at 60% 70%, #000 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 60% 70%, #000 20%, transparent 75%)",
          }}
        />
      </div>

      <div className="container-site relative py-20 sm:py-28">
        <Reveal className="flex items-center gap-3">
          <span className="font-mono text-[0.6875rem] text-accent">04</span>
          <span className="h-px w-10 bg-line" />
          <span className="eyebrow">Contact</span>
        </Reveal>

        <h2 className="mt-8 text-[clamp(3rem,11vw,10rem)] font-medium leading-[0.88] tracking-tightest">
          <SplitWords text="Let's build" />
          <br />
          <SplitWords text="something" delay={0.1} /> <SplitWords text="great." className="serif-accent text-accent" delay={0.2} />
        </h2>

        <Reveal delay={0.15}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Have a project, a role or just an idea? I'm open to <span className="text-fg">frontend</span> and{" "}
            <span className="text-fg">creative-dev</span> opportunities.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:mt-14 lg:grid-cols-[1fr_1.15fr] lg:items-stretch lg:gap-8">
          {/* ── Left: info cards ── */}
          <Reveal className="flex h-full flex-col gap-4">
            {/* Email */}
            <GlowCard className="w-full flex-1 p-6 sm:p-7" innerClassName="flex h-full flex-col gap-6">
              <span className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-ink shadow-[0_0_24px_-4px_rgba(200,255,61,0.7)]">
                  <MailIcon />
                </span>
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-white/50">Email me</span>
              </span>

              <ComposePreview />

              <span className="mt-auto block">
                <span className="block break-all text-[clamp(1.3rem,2.4vw,1.85rem)] font-medium tracking-tight text-fg">
                  {profile.email}
                </span>
                <span className="mt-5 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={copyEmail}
                    data-cursor="Copy"
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
                  >
                    <CopyIcon className="h-4 w-4" />
                    Copy email
                  </button>
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-fg transition-colors hover:border-accent/60 hover:text-accent"
                  >
                    Open mail app
                    <ArrowIcon className="h-3.5 w-3.5" />
                  </a>
                </span>
              </span>
            </GlowCard>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Availability */}
              <GlowCard className="p-6">
                <span className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                  </span>
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">Available</span>
                </span>
                <span className="mt-4 block text-lg font-medium tracking-tight text-fg">Open to new work</span>
                <span className="mt-1 block text-sm text-muted">Full-time roles & freelance projects</span>
              </GlowCard>

              {/* Local time */}
              <GlowCard className="p-6">
                <span className="flex items-center gap-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-white/50">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Local time
                </span>
                <span className="mt-4 block text-lg font-medium tabular-nums tracking-tight text-fg">{time} IST</span>
                <span className="mt-1 block text-sm text-muted">{profile.location} · replies within 24h</span>
              </GlowCard>
            </div>

            {/* Socials */}
            <div className="flex flex-wrap gap-3">
              {github && (
                <GlowCard as="a" href={github.href} target="_blank" rel="noreferrer" className="flex-1 px-5 py-4">
                  <span className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-3 text-sm font-medium text-fg">
                      <GithubIcon className="h-5 w-5" />
                      GitHub
                    </span>
                    <ArrowIcon className="h-4 w-4 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                  </span>
                </GlowCard>
              )}
              {others.map((s) => (
                <GlowCard key={s.label} as="a" href={s.href} target="_blank" rel="noreferrer" className="flex-1 px-5 py-4">
                  <span className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-3 text-sm font-medium text-fg">
                      {s.label === "LinkedIn" && <LinkedinIcon className="h-[18px] w-[18px]" />}
                      {s.label}
                    </span>
                    <ArrowIcon className="h-4 w-4 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                  </span>
                </GlowCard>
              ))}
              {profile.resume && (
                <GlowCard as="a" href={profile.resume} target="_blank" rel="noreferrer" className="flex-1 px-5 py-4">
                  <span className="flex items-center justify-between gap-4 text-sm font-medium text-fg">
                    Résumé
                    <ArrowIcon className="h-4 w-4 rotate-90 text-muted transition-colors group-hover:text-accent" />
                  </span>
                </GlowCard>
              )}
            </div>
          </Reveal>

          {/* ── Right: the form, in a glowing card ── */}
          <Reveal delay={0.1}>
            <div className="glow-border relative h-full rounded-3xl p-px">
              <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-[#0e0e10]/90 p-6 backdrop-blur-xl sm:p-9">
                <AnimatePresence mode="wait" initial={false}>
                  {status === "sent" ? (
                    <motion.div
                      key="sent"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex min-h-[460px] flex-col items-start justify-center"
                    >
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-2xl text-ink shadow-[0_0_40px_-6px_rgba(200,255,61,0.8)]">
                        ✓
                      </span>
                      <h3 className="mt-6 text-3xl font-medium tracking-tight">Message sent.</h3>
                      <p className="mt-2 text-muted">Thanks for reaching out. I'll get back to you within a day.</p>
                      <button onClick={() => setStatus("idle")} className="btn-ghost mt-8">
                        Send another
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={submit} className="flex h-full flex-col gap-6" exit={{ opacity: 0 }} noValidate>
                      <div>
                        <h3 className="text-2xl font-medium tracking-tight sm:text-3xl">
                          Send a <span className="serif-accent text-accent">message</span>
                        </h3>
                        <p className="mt-2 text-sm text-muted">Tell me a little about it. I read every message.</p>
                      </div>

                      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

                      <div>
                        <span className="mb-2.5 block font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-white/50">I'm reaching out about</span>
                        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Topic">
                          {topics.map((t) => (
                            <button
                              key={t}
                              type="button"
                              role="radio"
                              aria-checked={topic === t}
                              onClick={() => setTopic(t)}
                              className={`relative rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${
                                topic === t ? "border-accent text-ink" : "border-white/10 text-muted hover:border-white/25 hover:text-fg"
                              }`}
                            >
                              {topic === t && (
                                <motion.span
                                  layoutId="topic-pill"
                                  className="absolute inset-0 rounded-full bg-accent"
                                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                />
                              )}
                              <span className="relative">{t}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Your name" name="name" value={form.name} onChange={update} placeholder="Jane Doe" autoComplete="name" required />
                        <Field label="Your email" name="email" type="email" value={form.email} onChange={update} placeholder="jane@company.com" autoComplete="email" required />
                      </div>
                      <Field
                        label="Message"
                        as="textarea"
                        name="message"
                        rows={5}
                        value={form.message}
                        onChange={update}
                        placeholder="Tell me about your project, timeline and budget…"
                        required
                        wrapClassName="flex flex-1 flex-col"
                        className="min-h-[140px] flex-1"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                        <Magnetic>
                          <button
                            type="submit"
                            disabled={status === "sending"}
                            className="btn-primary group !px-8 !py-4 shadow-[0_10px_40px_-10px_rgba(200,255,61,0.6)] disabled:opacity-60"
                            data-cursor="Send"
                          >
                            {status === "sending" ? "Sending…" : "Send message"}
                            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                          </button>
                        </Magnetic>
                        {status === "error" ? (
                          <p className="max-w-[16rem] text-right text-sm text-red-400" role="alert">
                            {errorText || (
                              <>
                                Couldn't send just now.{" "}
                                <a href={`mailto:${profile.email}`} className="underline underline-offset-2 hover:text-red-300">
                                  Email me directly
                                </a>
                                .
                              </>
                            )}
                          </p>
                        ) : (
                          <p className="text-xs text-white/40">Usually replies within 24 hours</p>
                        )}
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
