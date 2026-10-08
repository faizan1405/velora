import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from "react";
import { ClientOnly } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Minus, Plus, Star } from "lucide-react";
import { S, INITIAL, PALETTE, sceneBus, hasWebGL } from "@/lib/story";
import { useUI } from "@/lib/ui-store";
import { useCart } from "@/lib/cart-store";
import { editorial, formatINR, getProduct, reviews } from "@/lib/products";
import { VButton } from "@/components/velora/VButton";
import { toast } from "sonner";
import type { Quality } from "@/components/three/SerumBottle";

const Experience = lazy(() => import("@/components/three/Experience"));

const BURGUNDY = "#5A1F2E";

/** Masked line helper */
function L({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`ln ${className}`}>
      <span>{children}</span>
    </span>
  );
}

function Chapter({ n, label }: { n: string; label: string }) {
  return (
    <div className="eyebrow ink flex items-center gap-3 opacity-60">
      <span>({n})</span>
      <span className="h-px w-8 bg-current" />
      <span>{label}</span>
    </div>
  );
}

const INGREDIENTS = [
  { pct: "10%", name: "Vitamin C", note: "Stabilised brightness, without sting" },
  { pct: "5%", name: "Niacinamide", note: "Refines tone, texture and pores" },
  { pct: "2%", name: "Hyaluronic Complex", note: "Three weights of hydration" },
  { pct: "+", name: "Peptide Complex", note: "Supports firmness and barrier" },
];

const BENEFITS = [
  ["Deep", "Hydration"],
  ["Brighter", "Skin"],
  ["Smoother", "Texture"],
  ["Barrier", "Support"],
];

const STATS = [
  { n: 94, label: "Improved hydration" },
  { n: 89, label: "Smoother-looking skin" },
  { n: 87, label: "Improved radiance" },
];

const PARTS = ["Dropper bulb", "Champagne collar", "Glass pipette", "Label", "Optical glass shell", "Liquid core"];

const ED_IMAGES = [
  { src: editorial.edPortrait, alt: "Portrait of a woman with radiant skin, eyes closed", cls: "left-[5%] top-[12%] w-[22vw] aspect-[4/5]", w: 1024, h: 1280 },
  { src: editorial.edSkin, alt: "Macro of dewy skin with a drop of serum", cls: "left-[31%] top-[38%] w-[16vw] aspect-[4/5]", w: 1024, h: 1280 },
  { src: editorial.edApply, alt: "Hands applying serum from a glass dropper", cls: "left-[52%] top-[8%] w-[15vw] aspect-[4/5]", w: 1024, h: 1280 },
  { src: editorial.edVanity, alt: "Travertine vanity at golden hour", cls: "right-[4%] top-[16%] w-[23vw] aspect-[5/4]", w: 1280, h: 1024 },
];
const ED_IMAGES_M = [
  "left-[4%] top-[14%] w-[44vw] aspect-[4/5]",
  "right-[4%] top-[22%] w-[38vw] aspect-[4/5]",
  "left-[10%] top-[44%] w-[34vw] aspect-[4/5]",
  "right-[6%] top-[50%] w-[46vw] aspect-[5/4]",
];

type Shot = Partial<
  Pick<
    typeof INITIAL,
    | "camX" | "camY" | "camZ" | "tgtX" | "tgtY" | "bX" | "bY" | "bZ" | "bRotX" | "bRotY"
    | "bScale" | "fov" | "key" | "rim" | "rimHue" | "warm" | "ambient"
  >
>;

export function Story() {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState<boolean | null>(null);
  const [quality, setQuality] = useState<Quality>("high");
  const [webgl, setWebgl] = useState(true);
  const loaded = useUI((s) => s.loaded);
  const buyActive = useUI((s) => s.buyActive);
  const setUI = useUI((s) => s.set);
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const serum = getProduct("radiance-serum")!;

  useEffect(() => {
    const m = window.matchMedia("(max-width: 767px)").matches;
    const ok = hasWebGL();
    setWebgl(ok);
    if (!ok) setUI({ noWebgl: true });
    const cores = navigator.hardwareConcurrency ?? 8;
    setQuality(m || cores <= 4 ? "low" : "high");
    setMobile(m);
  }, [setUI]);

  /* ---------------- Master timeline: one coordinated product film ---------------- */
  useEffect(() => {
    if (mobile === null || !wrap.current || !stage.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const m = mobile;
    const X = (desk: number, mob: number) => (m ? mob : desk);

    const base: Required<Shot> = {
      camX: 0, camY: 0, camZ: X(6.6, 8.6), tgtX: 0, tgtY: 0,
      bX: 0, bY: X(-0.05, 0.15), bZ: 0, bRotX: 0, bRotY: 0.22, bScale: 1, fov: 32,
      key: 0.6, rim: 1.8, rimHue: 0, warm: 0.45, ambient: 0.12,
    };
    Object.assign(S, INITIAL, base, { intro: useUI.getState().loaded ? 1 : 0 });
    const st = stage.current;
    const bg = st.querySelector(".st-bg");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: () => sceneBus.invalidate(),
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: "bottom bottom",
          scrub: m ? 0.8 : 1.4,
          onUpdate: (self) => {
            S.progress = self.progress;
            const active = self.progress > 0.955;
            if (active !== useUI.getState().buyActive) useUI.getState().set({ buyActive: active });
          },
        },
      });
      const E = "power3.inOut";
      // Shots are sequential camera/product keyframes; each carries the full
      // composition so consecutive shots never fight over the same property.
      let cur: Required<Shot> = { ...base };
      const shot = (t: number, dur: number, o: Shot, ease = E) => {
        cur = { ...cur, ...o };
        tl.to(S, { ...cur, duration: dur, ease }, t);
      };
      const lines = (sel: string, at: number, dur = 2.2) =>
        tl.fromTo(`${sel} .ln > span`, { yPercent: 115 }, { yPercent: 0, duration: dur, stagger: 0.35, ease: "power3.out" }, at);
      const linesOut = (sel: string, at: number, dur = 1.4) =>
        tl.to(`${sel} .ln > span`, { yPercent: -115, duration: dur, stagger: 0.15, ease: "power3.in" }, at);
      const show = (sel: string, at: number) => tl.fromTo(sel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, at);
      const hide = (sel: string, at: number) => tl.to(sel, { autoAlpha: 0, duration: 0.01 }, at);
      const bgTo = (color: string, at: number, dur: number) => bg && tl.to(bg, { backgroundColor: color, duration: dur, ease: "power2.inOut" }, at);
      const inkTo = (color: string, at: number, dur: number) => tl.to(st, { "--ink": color, duration: dur, ease: "power2.inOut" }, at);

      /* 1 — FRONT HERO (0–6): label to camera, dramatic edge light, slow dolly-in */
      shot(0, 6, { camZ: X(6.1, 8.2), bRotY: 0.3 }, "power1.inOut");
      tl.to(".s1", { autoAlpha: 0, y: -30, duration: 2.5, ease: "power2.in" }, 2.5);
      tl.to(".b1", { scale: 1.08, autoAlpha: 0, duration: 4, ease: "power1.in" }, 2);

      /* 2 — THREE-QUARTER (6–14): product travels to 65% right, camera tracks sideways */
      bgTo(PALETTE.plum, 5, 5);
      shot(6, 5, { bX: X(1.25, 0), bY: X(-0.05, -0.35), bRotY: 0.72, camX: X(0.45, 0.15), camZ: X(5.6, 7.6), tgtX: X(0.6, 0), key: 0.95, rim: 1.4, ambient: 0.18 });
      shot(11, 3, { bRotY: 0.86, camZ: X(5.3, 7.3) }, "power1.inOut");
      show(".b2", 6);
      lines(".b2", 6.5);
      linesOut(".b2", 12.6);
      show(".s2", 6.8);
      lines(".s2", 7.2, 1.6);
      linesOut(".s2", 12.6, 1);
      tl.to(".s2", { autoAlpha: 0, duration: 0.8 }, 12.8);

      /* 3 — SIDE PROFILE (14–22): full profile, strong rim, type behind */
      shot(14, 4, { bX: X(0.15, 0), bY: 0, bRotY: 1.55, camX: X(-0.3, 0), tgtX: X(0.05, 0), camZ: X(6.4, 8.6), rim: 3, key: 0.45, rimHue: 0.35, ambient: 0.1 });
      shot(18, 4, { bRotY: 1.64, camY: 0.25, camZ: X(6.0, 8.2) }, "power1.inOut");
      show(".b3", 14.2);
      lines(".b3", 14.6, 2.4);
      linesOut(".b3", 20.4);

      /* 4 — BACK ANGLE · FORMULATION (22–36): camera lowers and travels through the formula */
      bgTo(BURGUNDY, 22, 6);
      shot(22, 4, { bX: 0, bY: 0, bZ: -2.5, bRotY: 3.05, camX: 0, camY: -0.55, tgtX: 0, tgtY: 0.1, camZ: 9.2, fov: 36, key: 1.1, warm: 0.1, rim: 1.5, rimHue: 0, ambient: 0.3 });
      shot(26, 10, { camZ: 1.4, camX: X(0.12, 0), camY: -0.3, bRotY: 3.25 }, "power1.inOut");
      tl.to(S, { ingredients: 4, duration: 8 }, 24.5);
      tl.to(S, { ingredients: 0, duration: 1.5 }, 35);
      tl.to(S, { orbit: 2, duration: 15 }, 22);
      tl.to(S, { particles: 0.85, duration: 3 }, 22);
      tl.to(S, { particles: 0.3, duration: 3 }, 35);
      show(".b4", 22.5);
      lines(".b4", 23, 2.4);
      show(".s4", 23.5);
      lines(".s4 .hd", 24.2, 2);
      INGREDIENTS.forEach((_, i) => {
        tl.fromTo(`.s4 .ing-${i}`, { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 1.2, ease: "power3.out" }, 25.5 + i * 2.2);
      });
      tl.to(".s4", { autoAlpha: 0, duration: 1.4, ease: "power2.in" }, 34.5);
      linesOut(".b4", 34.4);

      /* 5 — CAP CLOSE-UP (36–44): crane above, look down into the metal */
      shot(36, 4.5, { bZ: 0, bRotY: 3.7, bRotX: 0.08, camX: X(0.2, 0), camY: X(2.5, 2.8), camZ: X(2.3, 3.0), tgtX: 0, tgtY: 0.78, fov: 28, key: 1.3, warm: 0.6, rim: 1.9, ambient: 0.2 });
      shot(40.5, 3.5, { camY: X(2.15, 2.5), camZ: X(1.85, 2.6), bRotY: 4.1 }, "power1.inOut");
      show(".s5", 37.5);
      lines(".s5", 38, 2);
      linesOut(".s5", 42.6, 1.2);

      /* 6 — LABEL MACRO → DROPPER → THE DROP (44–57) */
      shot(44, 3, { bRotY: Math.PI * 2, bRotX: 0, camX: X(-0.85, -0.3), camY: -0.25, camZ: X(1.55, 2.1), tgtX: X(-0.3, 0), tgtY: -0.3, fov: 30, key: 1.1, rim: 1.2, warm: 0.5 });
      shot(47, 3, { camX: X(0.85, 0.3), tgtX: X(0.3, 0) }, "power1.inOut");
      show(".b6", 44);
      tl.fromTo(".b6 .crop", { xPercent: 8 }, { xPercent: -32, duration: 6, ease: "power1.inOut" }, 44);
      tl.to(".b6", { autoAlpha: 0, duration: 1 }, 49.5);
      tl.to(S, { lift: 1, duration: 2, ease: "power2.inOut" }, 49.5);
      shot(50, 2, { camX: 0.9, camY: 1.15, camZ: X(2.2, 2.9), tgtX: 0.9, tgtY: 1.0, fov: 30, key: 1.2, warm: 0.7 });
      tl.to(S, { drop: 1, duration: 1.5, ease: "power1.inOut" }, 51.6);
      tl.to(S, { drop: 2, duration: 2.4, ease: "power2.in" }, 53.1);
      shot(53.1, 2.4, { camY: -0.6, tgtY: -1.1, camZ: X(2.0, 2.6) }, "power2.in");
      // the drop blooms into the lens and becomes the next scene
      tl.to(S, { drop: 3, duration: 1.5, ease: "power2.in" }, 55.5);
      shot(55.5, 1.5, { camY: -1.05, tgtY: -1.2, camZ: X(1.25, 1.6) }, "power2.in");
      bgTo(PALETTE.skin, 56, 1);
      inkTo(PALETTE.black, 56, 1);
      tl.set(S, { drop: 0, lift: 0 }, 57.05);
      show(".s6", 51);
      lines(".s6", 51.4, 2);
      linesOut(".s6", 55.2, 1);

      /* 7 — EXTREME FOREGROUND → LEFT 30% · BENEFITS (57–68) */
      shot(57, 2.5, { bX: X(-0.5, 0), bY: X(0.1, 0.4), bZ: X(3.6, 2.8), bRotY: 6.9, bRotX: -0.1, camX: 0, camY: 0, tgtX: 0, tgtY: 0, camZ: 6, fov: 32, key: 1.15, warm: 0.9, rim: 0.9, rimHue: 0.1, ambient: 0.35 });
      shot(59.5, 2.5, { bX: X(-1.3, 0), bY: X(0, 0.55), bZ: 0, camZ: X(6.2, 9) });
      show(".s7", 59.5);
      show(".b7", 59.5);
      const T = [60, 62, 64, 66];
      T.forEach((t0, k) => {
        if (k > 0) {
          shot(t0, 1.8, {
            bRotY: 6.9 + 0.75 * k,
            bRotX: k % 2 ? 0.1 : -0.1,
            camX: X([0, 0.5, -0.4, 0.3][k]!, 0),
            camY: X([0, 0.25, -0.2, 0.1][k]!, 0),
            warm: [0.9, 0.6, 1, 0.75][k]!,
            key: [1.15, 0.9, 1.3, 1.05][k]!,
            rimHue: [0.1, 0.4, 0.2, 0.3][k]!,
          });
        }
        tl.fromTo(`.s7 .ben-${k} .ln > span`, { yPercent: 115 }, { yPercent: 0, duration: 1.3, stagger: 0.2, ease: "power3.out" }, t0 + 0.3);
        tl.fromTo(`.b7 .num-${k}`, { autoAlpha: 0, xPercent: 6 }, { autoAlpha: 1, xPercent: 0, duration: 1.1 }, t0 + 0.2);
        if (k < 3) {
          linesOut(`.s7 .ben-${k}`, T[k + 1]! - 0.6, 0.9);
          tl.to(`.b7 .num-${k}`, { autoAlpha: 0, xPercent: -6, duration: 0.9 }, T[k + 1]! - 0.5);
        }
      });
      linesOut(".s7 .ben-3", 67.4, 0.9);
      tl.to(".b7", { autoAlpha: 0, duration: 1 }, 67.4);
      hide(".s7", 68.4);

      /* 8 — CLINICAL (68–74): small product in the distance, skin → ivory */
      bgTo(PALETTE.ivory, 68, 2.5);
      tl.to(S, { particles: 0.12, duration: 2 }, 68);
      shot(68, 3, { bX: X(1.7, 0.5), bY: X(0.25, 1.0), bZ: -3, bScale: 0.85, bRotY: 10.4, bRotX: 0, camX: 0, camY: 0, camZ: X(6.4, 9), key: 0.8, warm: 0.7, ambient: 0.3, rim: 1 });
      show(".s8", 69);
      tl.fromTo(".s8 .stat", { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, stagger: 0.6, duration: 1.4, ease: "power3.out" }, 69.4);
      STATS.forEach((s, i) => {
        tl.fromTo(`.s8 .num-${i}`, { textContent: 0 }, { textContent: s.n, snap: { textContent: 1 }, duration: 2, ease: "power2.out" }, 69.4 + i * 0.6);
      });
      tl.to(".s8", { autoAlpha: 0, y: -30, duration: 1.2, ease: "power2.in" }, 72.8);

      /* 9 — EXPLODED VIEW (74–84): ivory → noir, precise axial separation */
      bgTo(PALETTE.black, 73.5, 2);
      inkTo(PALETTE.ivory, 73.5, 2);
      shot(74, 3, { bX: X(-0.55, 0), bY: X(-0.05, -0.1), bZ: 0, bScale: X(0.8, 0.6), bRotY: Math.PI * 4 + 0.35, bRotX: 0.04, camX: 0, camY: X(0.55, 0.5), tgtX: X(-0.2, 0), tgtY: X(0.55, 0.5), camZ: X(10.5, 13), key: 1.2, rim: 2.2, warm: 0.4, ambient: 0.22 });
      shot(77, 7, { bRotY: Math.PI * 4 + 0.6, camZ: X(10, 12.5) }, "power1.inOut");
      tl.to(S, { explode: 1, duration: 4, ease: "power3.inOut" }, 75.5);
      tl.to(S, { explode: 0, duration: 2.6, ease: "power3.inOut" }, 81.4);
      show(".b9", 77);
      lines(".b9", 77.4, 2);
      linesOut(".b9", 81, 1.2);
      show(".s9", 78);
      tl.fromTo(".s9 li", { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, stagger: 0.25, duration: 0.9 }, 78.2);
      tl.to(".s9", { autoAlpha: 0, duration: 1 }, 81);

      /* 10 — EDITORIAL (84–90): noir → ivory, product steps back */
      bgTo(PALETTE.ivory, 83.5, 2);
      inkTo(PALETTE.black, 83.5, 2);
      shot(84, 3, { bX: X(1.9, 0.55), bY: X(-0.65, -1.0), bZ: -1, bScale: 0.55, bRotY: 13.5, bRotX: 0, camY: 0, tgtY: 0, tgtX: 0, camZ: X(7, 9), key: 0.75, warm: 0.85, ambient: 0.3, rim: 1 });
      shot(87, 3, { bRotY: 14 }, "power1.inOut");
      show(".b10", 84);
      tl.fromTo(".b10 .ed", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, stagger: 0.5, ease: "power3.out" }, 84.3);
      tl.fromTo(".b10 .ed img", { scale: 1.3 }, { scale: 1, duration: 3.4, stagger: 0.5, ease: "power2.out" }, 84.3);
      tl.fromTo(".b10 .ed", { y: (i: number) => ([80, 140, 60, 120][i] ?? 0) }, { y: (i: number) => -([80, 140, 60, 120][i] ?? 0), duration: 6 }, 84);
      show(".s10", 84.5);
      lines(".s10", 85, 2);
      linesOut(".s10", 88.6, 1);
      tl.to(".s10", { autoAlpha: 0, duration: 0.8 }, 89.2);
      tl.to(".b10 .ed", { clipPath: "inset(0% 0% 100% 0%)", duration: 1.2, stagger: 0.15, ease: "power3.in" }, 88.6);

      /* 11 — REVIEWS (90–94) */
      shot(90, 2, { bX: X(2.05, 0), bY: X(-0.8, -1.15), bZ: 0, bScale: X(0.55, 0.45), bRotY: 14.6 });
      show(".b11", 90);
      tl.fromTo(".b11 .track", { xPercent: m ? 5 : 18 }, { xPercent: m ? -78 : -52, duration: 4 }, 90);
      tl.fromTo(".b11 .rc", { y: (i: number) => ([60, -40, 90, -20, 50][i] ?? 0), rotate: (i: number) => ([-3, 2, -1.5, 3, -2][i] ?? 0) }, { y: (i: number) => ([-40, 30, -60, 40, -30][i] ?? 0), rotate: (i: number) => ([-1, 1, 1, 1.5, -1][i] ?? 0), duration: 4 }, 90);
      tl.fromTo(".b11 .rc", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, stagger: 0.2 }, 90.1);
      tl.to(".b11", { autoAlpha: 0, duration: 0.8 }, 93.4);
      show(".s11", 90.1);
      lines(".s11", 90.3, 1.4);
      tl.to(".s11", { autoAlpha: 0, duration: 0.8 }, 93.3);

      /* 12 — FINAL PRODUCT (94–100): luxury studio on near black */
      bgTo(PALETTE.black, 93.5, 2);
      inkTo(PALETTE.ivory, 93.5, 2);
      shot(94, 4, { bX: X(-1.05, 0), bY: X(-0.05, 0.95), bZ: 0, bScale: X(1, 0.72), bRotY: Math.PI * 6 + 0.25, bRotX: 0, camX: X(-0.2, 0), camY: 0.1, tgtX: X(-0.4, 0), tgtY: 0, camZ: X(6.2, 9.5), fov: 32, key: 1.0, warm: 0.55, rim: 1.8, rimHue: 0.15, ambient: 0.22 });
      show(".s12", 95);
      lines(".s12 .ttl", 95.3, 1.8);
      tl.fromTo(".s12 .fx", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.2, duration: 1.2, ease: "power3.out" }, 96.2);
      tl.to({}, { duration: 0.01 }, 100);
    }, st);

    ScrollTrigger.refresh();
    sceneBus.invalidate();
    return () => {
      ctx.revert();
      useUI.getState().set({ buyActive: false });
    };
  }, [mobile]);

  // Load reveal: light slowly finds the bottle's edges
  useEffect(() => {
    if (!loaded || mobile === null || !stage.current) return;
    const light = gsap.fromTo(S, { intro: 0 }, { intro: 1, duration: 3.2, ease: "power2.inOut", onUpdate: () => sceneBus.invalidate() });
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(".b1-in", { yPercent: 105 }, { yPercent: 0, duration: 1.8, stagger: 0.07, ease: "power4.out" }, 0.3);
      tl.fromTo(".s1-in", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 1.2, ease: "power3.out" }, 1.2);
    }, stage.current);
    return () => {
      light.kill();
      ctx.revert();
    };
  }, [loaded, mobile]);

  const addToBag = () => {
    add(serum.slug, qty);
    toast.success(`${qty} × Radiance Serum added to your bag`);
  };

  return (
    <section ref={wrap} className="relative h-[1500vh] md:h-[2000vh]" aria-label="The VELORA Radiance Serum film">
      <div ref={stage} className="sticky top-0 h-[100svh] w-full overflow-hidden" style={{ "--ink": "var(--ivory)" } as CSSProperties}>
        {/* Background */}
        <div className="st-bg absolute inset-0 bg-noir" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,color-mix(in_oklab,var(--noir)_50%,transparent)_100%)] opacity-60" />

        {/* BACK LAYER — type & imagery behind the product */}
        <div className="pointer-events-none absolute inset-0 ink">
          <div className="b1 absolute inset-0 flex items-center justify-center">
            <h1 className="flex overflow-hidden font-serif text-[27vw] leading-[0.8] tracking-[-0.04em] md:text-[24vw]">
              {"VELORA".split("").map((c, i) => (
                <span key={i} className="b1-in inline-block">{c}</span>
              ))}
            </h1>
          </div>

          <div className="b2 absolute inset-0 flex flex-col justify-center px-[5vw] font-serif text-[17vw] leading-[0.86] tracking-[-0.03em] md:text-[12.5vw]">
            <L>Not just</L>
            <L className="italic text-champagne">a serum.</L>
          </div>

          <div className="b3 absolute inset-0 flex flex-col items-center justify-center text-center font-serif text-[19vw] leading-[0.82] tracking-[-0.04em] md:text-[14vw]">
            <L>A daily</L>
            <L className="italic text-champagne">ritual.</L>
          </div>

          <div className="b4 absolute inset-x-0 top-[16vh] text-center font-serif text-[17vw] leading-none tracking-[-0.04em] opacity-90 md:top-[12vh] md:text-[13vw]">
            <L>Formulated</L>
          </div>

          <div className="b6 absolute inset-0 flex items-center overflow-hidden">
            <p className="crop whitespace-nowrap font-serif text-[46vw] leading-none tracking-[-0.05em] opacity-15">VELORA · RADIANCE</p>
          </div>

          <div className="b7 absolute inset-0">
            {["01", "02", "03", "04"].map((n, k) => (
              <span key={n} className={`num-${k} text-outline absolute bottom-[2vh] right-[3vw] font-serif text-[48vw] leading-none md:bottom-auto md:left-[2vw] md:right-auto md:top-1/2 md:-translate-y-1/2 md:text-[30vw]`}>
                {n}
              </span>
            ))}
          </div>

          <div className="b9 absolute inset-0 flex flex-col justify-center px-[4vw] font-serif text-[15vw] leading-[0.9] tracking-[-0.03em] md:text-[11vw]">
            <L>Engineered</L>
            <L className="text-right italic text-champagne">down to</L>
            <L>the last drop.</L>
          </div>

          <div className="b10 absolute inset-0">
            {ED_IMAGES.map((im, i) => (
              <figure key={i} className={`ed absolute overflow-hidden ${mobile ? ED_IMAGES_M[i] : im.cls}`}>
                <img src={im.src} alt={im.alt} width={im.w} height={im.h} loading="lazy" className="h-full w-full object-cover" />
              </figure>
            ))}
          </div>

          <div className="b11 absolute inset-0 flex items-center">
            <div className="track flex gap-[5vw] pl-[10vw] will-change-transform md:-mt-[22vh] md:pl-[42vw]">
              {reviews.map((r, i) => (
                <article key={r.name} className={`rc w-[72vw] shrink-0 bg-card p-8 text-card-foreground md:w-[24vw] md:p-10 ${i % 2 ? "md:mt-[10vh]" : "md:-mt-[8vh]"}`}>
                  <p className="text-xs tracking-[0.3em] text-champagne">★★★★★</p>
                  <p className="mt-6 font-serif text-2xl leading-snug md:text-[1.6vw]">“{r.text}”</p>
                  <p className="eyebrow mt-8 text-muted-foreground">{r.name} — {r.city}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* WEBGL LAYER — one persistent canvas */}
        <div className="absolute inset-0">
          {webgl ? (
            <ClientOnly fallback={null}>
              <Suspense fallback={null}>
                <Experience quality={quality} />
              </Suspense>
            </ClientOnly>
          ) : (
            <div className="flex h-full items-center justify-center">
              <img src={serum.img} alt="VELORA Radiance Serum" className="h-[60vh] w-auto object-contain" />
            </div>
          )}
        </div>

        {/* FRONT LAYER — copy that sits in front of the product */}
        <div className="pointer-events-none absolute inset-0 ink">
          {/* 1 */}
          <div className="s1 absolute inset-0">
            <div className="absolute bottom-[9vh] left-[5vw] max-w-[80vw] md:bottom-[8vh]">
              <p className="s1-in eyebrow mb-4 opacity-60">Radiance Serum — {formatINR(serum.price)}</p>
              <p className="s1-in font-serif text-3xl leading-[1.05] md:text-[3.2vw]">
                Skincare,
                <br />
                <em className="text-champagne">distilled</em> to its essence.
              </p>
            </div>
            <div className="s1-in absolute bottom-[3vh] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 md:bottom-[5vh]">
              <span className="eyebrow">Scroll to discover</span>
              <span className="relative block h-10 w-px overflow-hidden bg-current/20">
                <span className="scroll-hint absolute inset-0 bg-current" />
              </span>
            </div>
          </div>

          {/* 2 */}
          <div className="s2 absolute bottom-[8vh] left-[5vw] max-w-[78vw] md:bottom-[10vh] md:max-w-[22vw]">
            <Chapter n="01" label="The serum" />
            <p className="mt-5 text-sm leading-relaxed opacity-80 md:text-base">
              <L>Four actives. One weightless drop.</L>
              <L>Built to be the step your skin</L>
              <L>actually notices.</L>
            </p>
          </div>

          {/* 4 */}
          <div className="s4 absolute inset-0">
            <div className="hd absolute inset-x-0 bottom-[20vh] text-center font-serif text-[13vw] italic leading-none tracking-[-0.03em] text-champagne md:bottom-[16vh] md:text-[8vw]">
              <L>with purpose.</L>
            </div>
            <ul className="absolute bottom-[5vh] left-[5vw] right-[5vw] grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4 md:gap-10">
              {INGREDIENTS.map((ing, i) => (
                <li key={ing.name} className={`ing-${i}`}>
                  <span className="font-sans text-2xl font-medium tabular-nums md:text-3xl">{ing.pct}</span>
                  <p className="eyebrow mt-2">{ing.name}</p>
                  <p className="mt-1 hidden text-sm opacity-60 md:block">{ing.note}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* 5 */}
          <div className="s5 absolute bottom-[8vh] left-[5vw] font-serif text-[10vw] leading-[0.92] tracking-[-0.02em] md:text-[4.4vw]">
            <L>Designed</L>
            <L className="italic text-champagne">down to</L>
            <L>the detail.</L>
          </div>

          {/* 6 */}
          <div className="s6 absolute bottom-[8vh] right-[5vw] text-right font-serif text-[11vw] leading-[0.9] tracking-[-0.03em] md:text-[6vw]">
            <L>We obsessed</L>
            <L className="italic text-champagne">over every drop.</L>
          </div>

          {/* 7 */}
          <div className="s7 absolute inset-x-[5vw] top-[13vh] md:inset-x-auto md:right-[6vw] md:top-1/2 md:w-[40vw] md:-translate-y-1/2">
            <Chapter n="04" label="Benefits" />
            <div className="relative mt-6 h-[28vw] md:h-[15vw]">
              {BENEFITS.map(([a, b], k) => (
                <h2 key={a} className={`ben-${k} absolute inset-0 font-serif text-[13vw] uppercase leading-[0.88] tracking-[-0.02em] md:text-[7vw]`}>
                  <L>{a}</L>
                  <L className="italic text-plum">{b}</L>
                </h2>
              ))}
            </div>
          </div>

          {/* 8 */}
          <div className="s8 absolute inset-0 flex flex-col justify-end px-[5vw] pb-[6vh] md:justify-center md:pb-0">
            <Chapter n="05" label="Clinical results" />
            <div className="mt-6 grid grid-cols-3 gap-4 md:mt-10 md:w-[56vw] md:gap-12">
              {STATS.map((s, i) => (
                <div key={s.label} className="stat">
                  <p className="font-serif text-[15vw] leading-none tracking-[-0.04em] md:text-[10vw]">
                    <span className={`num-${i}`}>{s.n}</span>
                    <span className="text-[0.4em] text-champagne">%</span>
                  </p>
                  <p className="eyebrow mt-3 leading-relaxed">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-md text-xs opacity-50">Consumer perception study after 4 weeks of twice-daily use.</p>
          </div>

          {/* 9 — technical labels */}
          <div className="s9 absolute bottom-[7vh] right-[5vw] hidden md:block">
            <Chapter n="06" label="Anatomy" />
            <ul className="mt-6 space-y-4">
              {PARTS.map((p, i) => (
                <li key={p} className="eyebrow flex items-center gap-4 opacity-80">
                  <span className="h-px w-16 bg-current/40" />
                  <span className="tabular-nums opacity-60">0{i + 1}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 10 */}
          <div className="s10 absolute bottom-[6vh] left-[5vw] right-[5vw]">
            <Chapter n="07" label="Rituals" />
            <h2 className="mt-5 font-serif text-[16vw] leading-[0.85] tracking-[-0.04em] md:text-[10vw]">
              <L>Real skin.</L>
              <L className="italic text-plum">Real rituals.</L>
            </h2>
          </div>

          {/* 11 */}
          <div className="s11 absolute left-[5vw] top-[12vh] md:bottom-[6vh] md:top-auto">
            <Chapter n="08" label="Reviews" />
            <h2 className="mt-5 font-serif text-[11vw] leading-[0.9] tracking-[-0.03em] md:text-[5.5vw]">
              <L>Loved by</L>
              <L className="italic text-plum">real skin.</L>
            </h2>
            <p className="mt-4 font-serif text-3xl">
              4.9 / 5 <span className="ml-2 text-sm tracking-[0.3em] text-champagne">★★★★★</span>
            </p>
          </div>

          {/* 12 — purchase: 60% product / 40% information */}
          <div className="s12 absolute inset-0 flex flex-col justify-end px-[5vw] pb-[5vh] md:flex-row md:items-center md:justify-end md:pb-0">
            <p className="fx eyebrow absolute bottom-[6vh] left-[5vw] hidden items-center gap-3 opacity-60 md:flex">
              <span className="h-px w-10 bg-current" /> Drag to explore
            </p>
            <div className={`w-full md:w-[34vw] md:pr-[2vw] ${buyActive ? "pointer-events-auto" : "pointer-events-none"}`}>
              <div className="ttl">
                <p className="eyebrow opacity-60"><L>VELORA</L></p>
                <h2 className="mt-3 font-serif text-[11vw] leading-[0.88] tracking-[-0.03em] md:text-[5.6vw]">
                  <L>Radiance</L>
                  <L className="italic text-champagne">Serum</L>
                </h2>
              </div>
              <p className="fx eyebrow mt-6 opacity-60">30 ML</p>
              <p className="fx mt-3 font-serif text-5xl md:text-6xl">{formatINR(serum.price)}</p>
              <p className="fx mt-5 max-w-sm leading-relaxed opacity-75">
                Clinical-grade hydration.
                <br />
                Designed for everyday radiance.
              </p>
              <p className="fx mt-5 text-sm">
                <span className="tracking-[0.3em] text-champagne">★★★★★</span>
                <span className="ml-3 opacity-70">4.9 / 5 · {serum.reviews} reviews</span>
              </p>
              <div className="fx mt-8 flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <button aria-label="Decrease quantity" className="py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center tabular-nums">{qty}</span>
                  <button aria-label="Increase quantity" className="py-2" onClick={() => setQty((q) => q + 1)}>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <VButton variant="ivory" className="flex-1" onClick={addToBag}>Add to bag</VButton>
              </div>
              <button
                className="fx eyebrow mt-5 underline-offset-8 opacity-70 hover:underline hover:opacity-100"
                onClick={() => {
                  add(serum.slug, qty);
                  toast("Checkout isn't connected yet — your bag is saved.");
                }}
              >
                Buy now
              </button>
            </div>
          </div>
        </div>

        <div className="grain" />
      </div>
    </section>
  );
}
