// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      {
        // Dev source-inspector tags every JSX element with data-tsd-source; on
        // react-three-fiber elements that becomes an invalid 3D prop and crashes the scene.
        name: "strip-tsd-source-from-r3f",
        enforce: "post",
        transform(code: string, id: string) {
          if (!id.includes("/src/components/three/") || !code.includes("tsd-source")) return null;
          return {
            code: code
              .replace(/\s?data-tsd-source="[^"]*"/g, "")
              .replace(/["']data-tsd-source["']\s*:\s*["'][^"']*["']\s*,?/g, ""),
            map: null,
          };
        },
      },
    ],
    // Pre-bundle heavy client deps at startup so Vite never re-optimizes mid-session
    // (a late re-optimization loads a second React copy and blanks the page).
    optimizeDeps: {
      include: [
        "three",
        "@react-three/fiber",
        "@react-three/drei",
        "gsap",
        "gsap/ScrollTrigger",
        "lenis",
        "framer-motion",
        "zustand",
        "zustand/middleware",
        "@radix-ui/react-accordion",
      ],
    },
  },
});
