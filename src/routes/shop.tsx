import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/velora/ProductCard";
import { Footer } from "@/components/velora/Footer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop the collection — VELORA" },
      { name: "description", content: "Serum, cleanser, moisturiser, essence, night cream and SPF 50 — the complete VELORA skincare ritual." },
      { property: "og:title", content: "Shop the collection — VELORA" },
      { property: "og:description", content: "Six formulas built around the VELORA Radiance Serum." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const cats = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? products : products.filter((p) => p.category === cat);
  return (
    <main className="pt-32 md:pt-40">
      <section className="px-[5vw] pb-32">
        <p className="eyebrow text-muted-foreground">Shop</p>
        <h1 className="mt-5 font-serif text-[16vw] leading-[0.85] tracking-[-0.03em] md:text-[9vw]">
          The <em className="text-plum">collection</em>
        </h1>
        <div className="mt-12 flex flex-wrap gap-2 border-b border-border pb-6">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "eyebrow border px-4 py-2 transition-colors",
                cat === c ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-14 grid gap-x-8 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <ProductCard key={p.slug} p={p} index={i} />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
