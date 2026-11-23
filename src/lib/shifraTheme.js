// Restyle the embedded Shifra AI assistant to match this site (dark + lime).
//
// The widget renders inside an *open* Shadow DOM, so page CSS can't reach it.
// We wait for its host element (#shifra-assistant-root) and add one <style>
// tag inside its shadow root. Overrides are theme-agnostic, so they hold even
// if the assistant's theme is changed in the Shifra Builder.

const MIC_ICON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='3' width='6' height='11' rx='3'/%3E%3Cpath d='M5 11a7 7 0 0 0 14 0M12 18v3'/%3E%3C/svg%3E\")";

const CSS = `
  .shifra-popup, .shifra-btn {
    font-family: "Inter Tight", ui-sans-serif, system-ui, sans-serif !important;
  }
  button:focus-visible, input:focus-visible { outline-color: #c8ff3d !important; }

  /* ── Floating button: dark disc, lime ring + mic, soft ping ── */
  .shifra-btn.shifra-btn {
    width: 58px; height: 58px;
    background: #0e0e10 !important;
    border: 1px solid rgba(200,255,61,.45) !important;
    box-shadow: 0 10px 40px -10px rgba(200,255,61,.55), inset 0 0 0 1px rgba(255,255,255,.04) !important;
    overflow: visible;
    transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
  }
  .shifra-btn.shifra-btn:hover {
    transform: translateY(-2px) scale(1.04);
    border-color: rgba(200,255,61,.85) !important;
    box-shadow: 0 14px 48px -10px rgba(200,255,61,.75) !important;
  }
  .shifra-btn .shifra-btn-mark {
    inset: -1px !important;
    background: transparent !important;
    border: 1px solid rgba(200,255,61,.6);
    animation: ry-ping 2.6s ease-out infinite;
  }
  .shifra-btn img { display: none !important; }
  .shifra-btn::after {
    content: ""; position: relative; z-index: 2; width: 24px; height: 24px;
    background: #c8ff3d;
    -webkit-mask: ${MIC_ICON} center / contain no-repeat;
            mask: ${MIC_ICON} center / contain no-repeat;
  }
  @keyframes ry-ping {
    0% { transform: scale(1); opacity: .7; }
    80%, 100% { transform: scale(1.45); opacity: 0; }
  }

  /* ── Panel ── */
  .shifra-popup.shifra-popup {
    background: #0b0b0c !important;
    border: 1px solid rgba(200,255,61,.22) !important;
    box-shadow: 0 30px 90px -30px rgba(200,255,61,.35), 0 24px 70px rgba(0,0,0,.5) !important;
  }
  .shifra-popup .shifra-overlay {
    background: radial-gradient(circle at top, rgba(200,255,61,.14), transparent 48%) !important;
  }
  .shifra-popup .shifra-orb, .shifra-popup .shifra-orb-glow {
    background: radial-gradient(circle at 32% 30%, #f4ffd6 0%, #c8ff3d 42%, #5f7d12 100%) !important;
  }
  .shifra-popup .shifra-orb-glow { opacity: .35 !important; }
  .shifra-popup .shifra-title { color: #f2f2ee !important; font-weight: 600 !important; letter-spacing: -0.03em; }
  .shifra-popup .shifra-sub { color: #8d8d94 !important; }
  .shifra-popup .shifra-status { color: #c8ff3d !important; font-weight: 600 !important; }
  .shifra-popup .shifra-wave span { background: #c8ff3d !important; }
  .shifra-popup .shifra-user-text { color: #f2f2ee !important; }
  .shifra-popup .shifra-ai-text { color: rgba(242,242,238,.75) !important; }
  .shifra-popup .shifra-mic {
    background: #c8ff3d !important;
    box-shadow: 0 0 30px rgba(200,255,61,.45), 0 0 80px rgba(200,255,61,.18) !important;
  }
  .shifra-popup .shifra-mic-icon { filter: brightness(0) !important; }
  .shifra-popup .shifra-close { background: rgba(255,255,255,.08) !important; }
  .shifra-popup .shifra-footer { border-top-color: rgba(255,255,255,.07) !important; background: rgba(0,0,0,.25) !important; }
  .shifra-popup .shifra-command-input {
    background: rgba(255,255,255,.04) !important;
    border-color: rgba(255,255,255,.1) !important;
    color: #f2f2ee !important;
  }
  .shifra-popup .shifra-command-input:focus { border-color: rgba(200,255,61,.6) !important; }
  .shifra-popup .shifra-command-input::placeholder { color: rgba(255,255,255,.35) !important; }
  .shifra-popup .shifra-command-btn {
    background: #c8ff3d !important; color: #0a0a0b !important; box-shadow: none !important;
  }

  @media (max-width: 640px) {
    .shifra-btn.shifra-btn { width: 52px; height: 52px; }
  }
`;

export function themeShifraWidget() {
  if (typeof document === "undefined") return;
  const apply = () => {
    const root = document.getElementById("shifra-assistant-root")?.shadowRoot;
    if (!root) return false;
    if (!root.getElementById("ry-theme")) {
      const style = document.createElement("style");
      style.id = "ry-theme";
      style.textContent = CSS;
      root.appendChild(style); // after Shifra's own stylesheet, so these win
    }
    return true;
  };
  if (apply()) return;
  const observer = new MutationObserver(() => apply() && observer.disconnect());
  observer.observe(document.body, { childList: true });
  setTimeout(() => observer.disconnect(), 30000);
}
