import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/velora/Footer";
import { editorial } from "@/lib/products";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — VELORA" },
      { name: "description", content: "VELORA is a modern skincare house making fewer, better formulas for real skin and real rituals." },
      { property: "og:title", content: "About — VELORA" },
      { property: "og:description", content: "Fewer, better formulas for real skin and real rituals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <main className="pt-32 md:pt-40">
      <section className="px-[5vw]">
        <p className="eyebrow text-muted-foreground">About</p>
        <h1 className="mt-5 max-w-[16ch] font-serif text-[13vw] leading-[0.88] tracking-[-0.03em] md:text-[7vw]">
          Fewer formulas. <em className="text-plum">Better rituals.</em>
        </h1>
      </section>
      <section className="mt-20 grid gap-8 px-[5vw] md:grid-cols-12">
        <img src={editorial.edPortrait} alt="Portrait with radiant skin" width={1024} height={1280} loading="lazy" className="aspect-[4/5] w-full object-cover md:col-span-5" />
        <div className="flex flex-col justify-end md:col-span-6 md:col-start-7">
          <p className="font-serif text-3xl leading-snug md:text-4xl">
            VELORA began with a single question: what if every drop in the bottle had a reason to be there?
          </p>
          <p className="mt-8 max-w-lg text-muted-foreground">
            We work with formulators to build a short, considered ritual — serum first, everything else in service of it. No fillers, no fragrance, no noise. Just skin that looks and feels like yours, on its best day.
          </p>
        </div>
      </section>
      <section className="px-[5vw] py-32">
        <img src={editorial.edVanity} alt="Travertine vanity at golden hour" width={1280} height={1024} loading="lazy" className="aspect-[16/8] w-full object-cover" />
      </section>
      <Footer />
    </main>
  );
}
