import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Apply the redirects from vercel.json on localhost too (`npm run dev` and
// `npm run preview`), so short links like /bookstore behave the same as on Vercel.
function vercelRedirects() {
  let redirects = [];
  try {
    redirects = JSON.parse(readFileSync(new URL("./vercel.json", import.meta.url), "utf8")).redirects || [];
  } catch {
    // No vercel.json or no redirects: nothing to do
  }
  const middleware = (req, res, next) => {
    const path = (req.url || "").split("?")[0].replace(/\/+$/, "") || "/";
    const match = redirects.find((r) => r.source === path);
    if (!match) return next();
    res.statusCode = match.permanent ? 308 : 307;
    res.setHeader("Location", match.destination);
    res.end();
  };
  return {
    name: "vercel-redirects",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vercelRedirects()],
  optimizeDeps: {
    // The 3D wave is lazy-loaded, so pre-bundle its deps up front to avoid a
    // mid-session "new dependencies optimized" reload in dev.
    include: ["three", "@react-three/fiber", "lenis", "framer-motion", "@emailjs/browser"],
  },
});
