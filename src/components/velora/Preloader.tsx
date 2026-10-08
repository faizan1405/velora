import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { useUI } from "@/lib/ui-store";
import { lenisStore } from "@/lib/lenis";

export function Preloader() {
  const alreadyLoaded = useRef(useUI.getState().loaded);
  const ready = useUI((s) => s.sceneReady || s.noWebgl);
  const setUI = useUI((s) => s.set);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(alreadyLoaded.current);
  const [forced, setForced] = useState(false);
  const val = useRef({ v: 0 });
  const first = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (alreadyLoaded.current) return;
    lenisStore.lenis?.stop();
    window.scrollTo(0, 0);
    first.current = gsap.to(val.current, {
      v: 86,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => setCount(Math.round(val.current.v)),
    });
    const fallback = window.setTimeout(() => setForced(true), 8000);
    return () => {
      first.current?.kill();
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (alreadyLoaded.current || !(ready || forced)) return;
    first.current?.kill();
    const t = gsap.to(val.current, {
      v: 100,
      duration: 0.7,
      delay: 0.3,
      ease: "power2.inOut",
      onUpdate: () => setCount(Math.round(val.current.v)),
      onComplete: () => {
        window.setTimeout(() => {
          setDone(true);
          setUI({ loaded: true });
          lenisStore.lenis?.start();
        }, 250);
      },
    });
    return () => {
      t.kill();
    };
  }, [ready, forced, setUI]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[150] flex flex-col justify-between bg-plum p-[5vw] text-ivory"
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <p className="eyebrow opacity-60">Radiance Serum · Loading the ritual</p>
          <div>
            <p className="font-serif text-[22vw] leading-[0.8] tracking-[-0.04em] md:text-[16vw]">VELORA</p>
            <div className="mt-8 flex items-end justify-between">
              <div className="relative h-px w-[60vw] bg-ivory/15 md:w-[40vw]">
                <div className="absolute inset-y-0 left-0 bg-champagne" style={{ width: `${count}%` }} />
              </div>
              <span className="font-serif text-5xl tabular-nums md:text-7xl">{String(count).padStart(2, "0")}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
