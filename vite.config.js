import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // The 3D orb is lazy-loaded, so pre-bundle its deps up front to avoid a
    // mid-session "new dependencies optimized" reload in dev.
    include: ["three", "@react-three/fiber", "lenis", "framer-motion", "@emailjs/browser"],
  },
});
