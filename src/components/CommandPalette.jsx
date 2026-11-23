import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks, profile, projects, socials } from "../constants";
import { scrollToId, startScroll, stopScroll } from "../lib/scroll";

const CommandPalette = ({ open, setOpen, onToast }) => {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const items = useMemo(() => {
    const all = [
      ...navLinks.map((l) => ({ group: "Navigate", label: `Go to ${l.title}`, run: () => scrollToId(l.id) })),
      { group: "Navigate", label: "Back to top", run: () => scrollToId("top") },
      { group: "Navigate", label: "Take the guided tour", hint: "AI", run: () => window.dispatchEvent(new Event("portfolio:tour")) },
      ...projects.map((p) => ({
        group: "Projects",
        label: `Open ${p.title}`,
        hint: p.kind === "client" ? "Client" : "Personal",
        run: () => window.open(p.live, "_blank", "noopener"),
      })),
      ...projects.map((p) => ({
        group: "Projects",
        label: `Show ${p.title} on this page`,
        run: () => window.dispatchEvent(new CustomEvent("portfolio:project", { detail: p.slug })),
      })),
      {
        group: "Contact",
        label: "Copy email address",
        hint: profile.email,
        run: async () => {
          try {
            await navigator.clipboard.writeText(profile.email);
            onToast?.("Email copied to clipboard");
          } catch {
            window.location.href = `mailto:${profile.email}`;
          }
        },
      },
      { group: "Contact", label: "Send an email", run: () => (window.location.href = `mailto:${profile.email}`) },
      ...socials.map((s) => ({ group: "Social", label: `Open ${s.label}`, run: () => window.open(s.href, "_blank", "noopener") })),
    ];
    if (profile.resume) {
      all.push({ group: "Contact", label: "Download résumé", hint: "PDF", run: () => window.open(profile.resume, "_blank", "noopener") });
    }
    const q = query.trim().toLowerCase();
    return q ? all.filter((i) => `${i.label} ${i.group} ${i.hint || ""}`.toLowerCase().includes(q)) : all;
  }, [query, onToast]);

  // Global shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      stopScroll();
      setQuery("");
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      startScroll();
    }
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const run = (item) => {
    if (!item) return;
    setOpen(false);
    setTimeout(item.run, 120);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(items[index]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface/95 shadow-2xl shadow-black/60"
            initial={{ y: 16, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 8, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a command or search…"
                className="h-14 w-full bg-transparent text-[0.9375rem] text-fg outline-none placeholder:text-muted"
                aria-label="Search commands"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.625rem] text-muted">ESC</kbd>
            </div>

            <ul ref={listRef} className="max-h-[50vh] overflow-y-auto p-2" data-lenis-prevent role="listbox">
              {items.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">No results for “{query}”</li>}
              {items.map((item, i) => {
                const header = item.group !== lastGroup;
                lastGroup = item.group;
                return (
                  <li key={item.label}>
                    {header && <p className="px-3 pb-1 pt-3 eyebrow !text-[0.625rem]">{item.group}</p>}
                    <button
                      data-idx={i}
                      role="option"
                      aria-selected={i === index}
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => run(item)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        i === index ? "bg-white/[0.07] text-fg" : "text-muted"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.hint && <span className="truncate pl-4 font-mono text-[0.6875rem] text-muted">{item.hint}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-4 border-t border-line px-5 py-3 font-mono text-[0.625rem] text-muted">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span className="ml-auto">esc close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
