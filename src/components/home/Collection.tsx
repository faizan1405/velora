import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { products } from "@/lib/products";
import { useUI } from "@/lib/ui-store";
import { ProductCard } from "@/components/velora/ProductCard";

export function Collection() {
  const ref = useRef<HTMLElement>(null);
  const setUI = useUI((s) => s.set);

  useEffect(() => {
    if (!ref.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 80px",
        end: "max",
        onToggle: (self) => setUI({ navSolid: self.isActive }),
      });
      gsap.utils.toArray<HTMLElement>(".pc").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 80, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.2, ease: "power3.out", delay: (i % 3) * 0.12, scrollTrigger: { trigger: el, start: "top 90%" } },
        );
      });
    }, ref);
    return () => {
      ctx.revert();
      setUI({ navSolid: false });
    };
  }, [setUI]);

  return (
    <section ref={ref} id="collection" className="relative bg-background px-[5vw] pb-32 pt-28 md:pt-40">
      <div className="flex flex-col justify-between gap-8 border-b border-border pb-10 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-muted-foreground">(09) The collection</p>
          <h2 className="mt-5 font-serif text-[14vw] leading-[0.85] tracking-[-0.03em] md:text-[7vw]">
            Six formulas.
            <br />
            <em className="text-plum">One ritual.</em>
          </h2>
        </div>
        <p className="max-w-sm text-muted-foreground">
          Built around the Radiance Serum — each step designed to layer, never compete.
        </p>
      </div>
      <div className="mt-16 grid gap-x-8 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <div key={p.slug} className={`pc ${i % 3 === 1 ? "lg:mt-24" : ""}`}>
            <ProductCard p={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
