import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { profile } from "../constants";

// ─────────────────────────────────────────────────────────────
//  "Dots assemble" intro
//  1. Faint dots drift in the dark.
//  2. They stream in and lock into a dotted RY monogram; a lime shimmer
//     runs through the letters and the dots shy away from the cursor.
//  3. Exit: the dots fall into a perspective wave that matches the hero's
//     WebGL dot-wave (same camera, same wave maths) and hand over to it
//     as the page appears.
// ─────────────────────────────────────────────────────────────

const BG = "#070708";
const TEXT = "RY";
const FAMILY = '"Instrument Serif"';
const easeOut = [0.22, 1, 0.36, 1];

// Timeline (ms)
const START_MIN = 280; // assembly never starts before this (dust fades in first)
const ASSEMBLE = 1750; // from assembly start until every dot has landed
const HOLD = 520; // shimmer before release
const EXIT = 1420; // exit fully finished by this long after onDone

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// ── The hero's camera (see HeroWave.jsx): position (0, 1.5, 6) looking at (0, -0.9, -6), fov 55
const LEN = Math.hypot(2.4, 12);
const FY = -2.4 / LEN;
const FZ = -12 / LEN;
const UY = 12 / LEN;
const UZ = -2.4 / LEN;
const TAN = Math.tan((55 * Math.PI) / 360);

function project(x, y, z, W, H) {
  const dy = y - 1.5;
  const dz = z - 6;
  const depth = dy * FY + dz * FZ;
  if (depth < 0.5) return null;
  const yc = dy * UY + dz * UZ;
  return {
    sx: ((x / (depth * TAN * (W / H)) + 1) / 2) * W,
    sy: ((1 - yc / (depth * TAN)) / 2) * H,
    depth,
  };
}

// Same height field as the hero's vertex shader
function waveHeight(x, z, t) {
  const h =
    Math.sin(x * 0.32 + t * 0.55) * 0.32 + Math.sin(z * 0.45 + t * 0.7) * 0.22 + Math.sin((x + z) * 0.22 + t * 0.35) * 0.38;
  return h * 1.35;
}

/** Soft round dot sprites, pre-tinted from off-white to lime. */
function makeSprites(dpr) {
  const from = [246, 246, 242];
  const to = [200, 255, 61];
  const size = Math.round(24 * dpr);
  return Array.from({ length: 6 }, (_, i) => {
    const k = i / 5;
    const c = from.map((v, j) => Math.round(v + (to[j] - v) * k));
    const cv = document.createElement("canvas");
    cv.width = cv.height = size;
    const g = cv.getContext("2d");
    const r = size / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, `rgba(${c},1)`);
    grad.addColorStop(0.42, `rgba(${c},0.9)`);
    grad.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return cv;
  });
}

/** Rasterise the monogram and sample a regular dot grid inside the letterforms. */
function sampleMonogram(W, H) {
  const scan = (fontPx) => {
    const cw = Math.ceil(fontPx * 1.7);
    const ch = Math.ceil(fontPx * 1.35);
    const cv = document.createElement("canvas");
    cv.width = cw;
    cv.height = ch;
    const g = cv.getContext("2d", { willReadFrequently: true });
    g.font = `italic 400 ${fontPx}px ${FAMILY}`;
    g.textBaseline = "alphabetic";
    g.fillStyle = "#fff";
    g.fillText(TEXT, fontPx * 0.18, fontPx * 1.02);
    const { data } = g.getImageData(0, 0, cw, ch);
    let minX = cw;
    let minY = ch;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        if (data[(y * cw + x) * 4 + 3] > 20) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return { data, cw, minX, minY, maxX, maxY };
  };

  // Size the monogram to the viewport
  const ref = scan(200);
  if (ref.maxX < 0) return null;
  const k = Math.min((H * 0.44) / (ref.maxY - ref.minY), (W * 0.8) / (ref.maxX - ref.minX));
  const fontPx = Math.max(60, 200 * k);
  const s = scan(fontPx);
  const inkW = s.maxX - s.minX;
  const inkH = s.maxY - s.minY;
  const left = W / 2 - inkW / 2;
  const top = H / 2 - inkH / 2 - H * 0.01;

  const pick = (gap) => {
    const pts = [];
    for (let y = s.minY + gap / 2; y <= s.maxY; y += gap) {
      for (let x = s.minX + gap / 2; x <= s.maxX; x += gap) {
        if (s.data[((y | 0) * s.cw + (x | 0)) * 4 + 3] > 140) {
          pts.push(left + (x - s.minX), top + (y - s.minY));
        }
      }
    }
    return pts;
  };
  let gap = W < 640 ? 5 : 6.6;
  let pts = pick(gap);
  while (pts.length / 2 > 3000) {
    gap += 0.5;
    pts = pick(gap);
  }
  return { pts, gap, box: { left, top, w: inkW, h: inkH } };
}

/** Visible points of the hero's wave grid, as exit destinations. */
function waveCandidates(W, H) {
  const out = [];
  for (let z = -18; z <= 5; z += 0.42) {
    for (let x = -13; x <= 13; x += 0.42) {
      const p = project(x, -1.4, z, W, H);
      if (p && p.sx > -10 && p.sx < W + 10 && p.sy > H * 0.36 && p.sy < H + 10) out.push(x, z);
    }
  }
  return out;
}

const Preloader = ({ onDone }) => {
  const canvasRef = useRef(null);
  const bgRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);
  const onDoneRef = useRef(onDone);
  const doneRef = useRef(false);
  const [leaving, setLeaving] = useState(false);
  onDoneRef.current = onDone;

  // Use the intro time to fetch the hero's WebGL chunk, so the wave is ready on reveal
  useEffect(() => {
    import("./canvas/HeroWave").catch(() => {});
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sprites = makeSprites(dpr);
    const mount = performance.now();

    let W = 0;
    let H = 0;
    let n = 0; // letter dots
    let total = 0; // letter dots + dust
    let P = null; // particle arrays
    let t0 = Infinity; // assembly start (ms since mount)
    let tExit = Infinity; // exit start (ms since mount)
    let raf = 0;
    let alive = true;
    const mouse = { x: -9999, y: -9999 };

    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    // Dust shows immediately so the very first frames already look intentional
    const dustCount = W < 640 ? 110 : 240;

    const build = (layout) => {
      const pts = layout ? layout.pts : [];
      n = pts.length / 2;
      total = n + dustCount;
      const wave = waveCandidates(W, H);
      const prev = P;
      P = {
        sx: new Float32Array(total),
        sy: new Float32Array(total),
        tx: new Float32Array(total),
        ty: new Float32Array(total),
        ex: new Float32Array(total),
        ez: new Float32Array(total),
        delay: new Float32Array(total),
        dur: new Float32Array(total),
        swirl: new Float32Array(total),
        phase: new Float32Array(total),
        edelay: new Float32Array(total),
        lift: new Float32Array(total),
        ox: new Float32Array(total),
        oy: new Float32Array(total),
        x: new Float32Array(total),
        y: new Float32Array(total),
        a: new Float32Array(total),
        d: new Float32Array(total),
        c: new Float32Array(total),
        gap: layout ? layout.gap : 5,
      };
      for (let i = 0; i < total; i++) {
        const isDust = i >= n;
        // Start scattered, biased away from the centre so the letters "arrive"
        const ang = Math.random() * Math.PI * 2;
        const rad = (0.35 + Math.random() * 0.75) * Math.hypot(W, H) * 0.5;
        P.sx[i] = W / 2 + Math.cos(ang) * rad;
        P.sy[i] = H / 2 + Math.sin(ang) * rad * 0.8;
        // Keep dust where it already was (it is visible before the letters are measured)
        if (isDust && prev) {
          const j = prev.sx.length - dustCount + (i - n);
          if (j >= 0) {
            P.sx[i] = prev.sx[j];
            P.sy[i] = prev.sy[j];
          }
        }
        if (!isDust) {
          P.tx[i] = pts[i * 2];
          P.ty[i] = pts[i * 2 + 1];
          const along = (P.tx[i] - layout.box.left) / layout.box.w;
          P.delay[i] = along * 520 + Math.random() * 380;
          P.dur[i] = 820 + Math.random() * 520;
        } else {
          P.tx[i] = P.sx[i];
          P.ty[i] = P.sy[i];
        }
        P.swirl[i] = (Math.random() - 0.5) * 140;
        P.phase[i] = Math.random() * Math.PI * 2;
        const w = (Math.random() * wave.length) & ~1;
        P.ex[i] = wave[w] ?? 0;
        P.ez[i] = wave[w + 1] ?? 0;
        P.edelay[i] = Math.random() * 170;
        P.lift[i] = 4 + Math.random() * 12;
      }
    };
    build(null);

    let layout = null;
    const ready = () => {
      if (!alive || layout) return;
      layout = sampleMonogram(W, H);
      if (!layout) layout = { pts: [], gap: 5, box: { left: 0, top: 0, w: 1, h: 1 } };
      build(layout);
      t0 = Math.max(performance.now() - mount, START_MIN);
    };
    const fontTimer = setTimeout(ready, 1100);
    if (document.fonts?.load) document.fonts.load(`italic 400 100px ${FAMILY}`, TEXT).then(ready, ready);
    else ready();

    const onResize = () => {
      size();
      if (layout && tExit === Infinity) {
        layout = sampleMonogram(W, H) || layout;
        build(layout);
      }
    };
    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });

    const draw = (x, y, d, a, c) => {
      if (a <= 0.004) return;
      ctx.globalAlpha = a > 1 ? 1 : a;
      const s = sprites[Math.min(5, Math.max(0, Math.round(c * 5)))];
      ctx.drawImage(s, x - d / 2, y - d / 2, d, d);
    };

    const frame = (now) => {
      if (!alive) return;
      const t = now - mount;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      const dustIn = smooth(0, 450, t);
      const base = Math.max(2.4, P.gap * 0.95); // letter dot diameter incl. soft edge
      let progress = 0;

      if (t < tExit) {
        // ── Assemble + hold
        const holdT = t - t0 - ASSEMBLE;
        const shimmerOn = smooth(-250, 250, holdT);
        for (let i = 0; i < total; i++) {
          const drift = Math.sin(t * 0.0005 + P.phase[i]) * 10;
          const driftY = Math.cos(t * 0.0004 + P.phase[i] * 1.3) * 8;
          if (i >= n) {
            const x = P.sx[i] + drift * 1.6;
            const y = P.sy[i] + driftY * 1.6;
            P.x[i] = x;
            P.y[i] = y;
            P.a[i] = 0.16 * dustIn * (0.6 + 0.4 * Math.sin(t * 0.002 + P.phase[i]));
            P.d[i] = 3.2;
            P.c[i] = 0;
            draw(x, y, P.d[i], P.a[i], 0);
            continue;
          }
          const p = easeInOut(clamp01((t - t0 - P.delay[i]) / P.dur[i]));
          progress += p;
          // Organic path: lerp + a sideways swirl that peaks mid-flight
          const fx = P.sx[i] + drift;
          const fy = P.sy[i] + driftY;
          const dx = P.tx[i] - fx;
          const dy = P.ty[i] - fy;
          const len = Math.hypot(dx, dy) || 1;
          const sw = Math.sin(p * Math.PI) * P.swirl[i];
          let x = fx + dx * p - (dy / len) * sw;
          let y = fy + dy * p + (dx / len) * sw;

          // Cursor: landed dots shy away and spring back
          if (p > 0.98) {
            const mx = x - mouse.x;
            const my = y - mouse.y;
            const dist = Math.hypot(mx, my);
            let px = 0;
            let py = 0;
            if (dist < 110 && dist > 0.01) {
              const f = Math.pow(1 - dist / 110, 2) * 26;
              px = (mx / dist) * f;
              py = (my / dist) * f;
            }
            P.ox[i] += (px - P.ox[i]) * 0.14;
            P.oy[i] += (py - P.oy[i]) * 0.14;
            x += P.ox[i];
            y += P.oy[i];
          }

          // Lime shimmer band sweeping through the letters
          const band = Math.pow(0.5 + 0.5 * Math.sin(P.tx[i] * 0.009 - t * 0.0038 + P.ty[i] * 0.004), 3);
          const c = band * shimmerOn * p;
          // A slow swell rolls through the letters so the monogram breathes
          const swell = 0.5 + 0.5 * Math.sin(P.tx[i] * 0.02 + P.ty[i] * 0.012 - t * 0.003);
          const twinkle = 0.88 + 0.12 * Math.sin(t * 0.004 + P.phase[i]);
          P.x[i] = x;
          P.y[i] = y;
          P.a[i] = (0.2 + 0.8 * p) * twinkle * dustIn;
          P.d[i] = base * (0.82 + 0.3 * swell * p + 0.3 * c) * (p < 1 ? 1.2 - 0.2 * p : 1);
          P.c[i] = c;
          draw(x, y, P.d[i], P.a[i], c);
        }

        progress = n ? progress / n : 0;
        if (counterRef.current) counterRef.current.textContent = String(Math.round(progress * 100)).padStart(3, "0");
        if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;

        if (holdT >= HOLD && !doneRef.current) {
          // ── Release: remember where every dot is, then hand control to the exit
          doneRef.current = true;
          tExit = t;
          for (let i = 0; i < total; i++) {
            P.sx[i] = P.x[i];
            P.sy[i] = P.y[i];
            P.tx[i] = P.a[i];
            P.ty[i] = P.d[i];
            P.swirl[i] = P.c[i];
          }
          setLeaving(true);
          onDoneRef.current?.();
        }
      } else {
        // ── Fall into the hero's wave, then hand over to the real one
        const te = t - tExit;
        const waveT = te / 1000 + 2;
        const bgA = 1 - smooth(520, 1250, te);
        if (bgRef.current) bgRef.current.style.opacity = bgA.toFixed(3);
        const fadeOut = 1 - smooth(1080, EXIT - 40, te);
        for (let i = 0; i < total; i++) {
          const q = easeInOut(clamp01((te - P.edelay[i]) / 700));
          const h = waveHeight(P.ex[i], P.ez[i], waveT);
          const w = project(P.ex[i], -1.4 + h, P.ez[i], W, H);
          if (!w) continue;
          const crest = smooth(0.05, 0.9, h);
          const z = P.ez[i];
          const vis = smooth(-22, -6, z) * (1 - smooth(3, 6, z)) * (1 - smooth(9, 14, Math.abs(P.ex[i])));
          const wa = vis * (0.45 + 0.55 * crest) * 0.9;
          const wd = Math.max(2, (23.8 / w.depth) * 1.25);
          // A small lift before the fall makes the release feel physical
          const lift = Math.sin(clamp01(q * 1.6) * Math.PI) * P.lift[i] * (1 - q);
          const x = P.sx[i] + (w.sx - P.sx[i]) * q;
          const y = P.sy[i] + (w.sy - P.sy[i]) * q - lift;
          const a = (P.tx[i] + (wa - P.tx[i]) * easeOutCubic(q)) * fadeOut;
          const d = P.ty[i] + (wd - P.ty[i]) * q;
          const c = P.swirl[i] + (crest - P.swirl[i]) * q;
          draw(x, y, d, a, c);
        }
        if (te > EXIT) {
          ctx.clearRect(0, 0, W, H);
          return; // finished; App unmounts us shortly
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(fontTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const fade = (delay) => ({
    initial: { opacity: 0 },
    animate: { opacity: leaving ? 0 : 1 },
    transition: leaving ? { duration: 0.35, ease: easeOut } : { duration: 0.9, delay, ease: easeOut },
  });

  return (
    <div className="fixed inset-0 z-[100]" aria-hidden>
      <div ref={bgRef} className="absolute inset-0" style={{ background: BG }} />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.05] blur-[110px]"
        {...fade(0.4)}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Corner labels */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:p-10 sm:text-[11px]">
        <div className="flex justify-between gap-4">
          <motion.span {...fade(0.1)} className="text-fg">
            {profile.name}
          </motion.span>
          <motion.span {...fade(0.2)}>Portfolio © {new Date().getFullYear()}</motion.span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <motion.span {...fade(0.3)} className="max-w-[14rem] leading-relaxed">
            Creative Frontend
            <br />& MERN Developer
          </motion.span>
          <motion.div {...fade(0.35)} className="flex flex-col items-end gap-2.5">
            <span>
              <span ref={counterRef} className="tabular-nums text-fg">
                000
              </span>{" "}
              / 100
            </span>
            <span className="block h-px w-24 overflow-hidden bg-white/10 sm:w-36">
              <span ref={barRef} className="block h-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
