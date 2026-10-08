import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/velora/Footer";
import { editorial } from "@/lib/products";

export const Route = createFileRoute("/science")({
  head: () => ({
    meta: [
      { title: "The science — VELORA" },
      { name: "description", content: "How VELORA formulates: hyaluronic complex, stabilised vitamin C, niacinamide and peptides at meaningful percentages." },
      { property: "og:title", content: "The science — VELORA" },
      { property: "og:description", content: "Meaningful percentages, stabilised actives and formulas tested on real skin." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Science,
});

const ACTIVES = [
  { pct: "2%", name: "Hyaluronic Complex", body: "Three molecular weights hydrate the surface, mid-layers and deeper epidermis for cushioned, plumped-looking skin." },
  { pct: "10%", name: "Vitamin C", body: "An ethylated, oil-and-water-soluble form that stays stable in the bottle and gentle on the skin." },
  { pct: "5%", name: "Niacinamide", body: "Visibly refines pores, evens tone and supports a calmer, stronger barrier." },
  { pct: "+", name: "Peptide Complex", body: "Signal peptides that support the look of firmness and elasticity over time." },
];

function Science() {
  return (
    <main className="pt-32 md:pt-40">
      <section className="px-[5vw]">
        <p className="eyebrow text-muted-foreground">Science</p>
        <h1 className="mt-5 max-w-[14ch] font-serif text-[14vw] leading-[0.85] tracking-[-0.03em] md:text-[8vw]">
          Meaningful <em className="text-plum">percentages.</em> Nothing decorative.
        </h1>
      </section>
      <section className="mt-24 grid gap-px border-y border-border bg-border md:grid-cols-2">
        {ACTIVES.map((a) => (
          <article key={a.name} className="bg-background p-[5vw] md:p-14">
            <p className="font-serif text-7xl text-plum md:text-8xl">{a.pct}</p>
            <h2 className="eyebrow mt-6">{a.name}</h2>
            <p className="mt-4 max-w-md text-muted-foreground">{a.body}</p>
          </article>
        ))}
      </section>
      <section className="grid items-center gap-12 px-[5vw] py-32 md:grid-cols-2">
        <img src={editorial.texture} alt="Macro of serum texture" width={1024} height={1280} loading="lazy" className="aspect-[4/5] w-full object-cover" />
        <div>
          <h2 className="font-serif text-5xl leading-tight md:text-6xl">
            Formulated in small batches, <em className="text-plum">tested on real skin.</em>
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            Every VELORA formula is dermatologically tested, fragrance-free and made without parabens, sulphates or mineral oil.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
