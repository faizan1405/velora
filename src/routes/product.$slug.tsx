import { lazy, Suspense, useState } from "react";
import { createFileRoute, notFound, Link, ClientOnly } from "@tanstack/react-router";
import { Minus, Plus, Star, Box } from "lucide-react";
import { toast } from "sonner";
import { getProduct, products, reviews, formatINR } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { VButton } from "@/components/velora/VButton";
import { ProductCard } from "@/components/velora/ProductCard";
import { Footer } from "@/components/velora/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const ProductViewer = lazy(() => import("@/components/three/ProductViewer"));

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} — VELORA` : "Product — VELORA";
    const desc = p ? `${p.short} ${p.size}, ${formatINR(p.price)}.` : "VELORA skincare.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-serif text-5xl">We couldn't find that formula.</h1>
      <Link to="/shop" className="eyebrow underline underline-offset-8">
        Back to the collection
      </Link>
    </main>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState<number>(p.has3d ? -1 : 0);
  const others = products.filter((x) => x.slug !== p.slug);
  const pairing = others.slice(0, 2);
  const bundle = [p, ...pairing];
  const bundleTotal = bundle.reduce((a, x) => a + x.price, 0);

  return (
    <main key={p.slug} className="pt-24 md:pt-28">
      <section className="grid gap-10 px-[5vw] md:grid-cols-12 md:gap-14">
        {/* Gallery */}
        <div className="md:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden bg-muted" data-cursor={active === -1 ? "drag" : undefined}>
            {active === -1 ? (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--ivory)_0%,var(--muted)_70%)]">
                <ClientOnly fallback={<img src={p.img} alt={p.name} className="h-full w-full object-cover" />}>
                  <Suspense fallback={null}>
                    <ProductViewer />
                  </Suspense>
                </ClientOnly>
                <p className="eyebrow pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-muted-foreground">Drag to rotate</p>
              </div>
            ) : (
              <img src={p.gallery[active]} alt={p.name} width={896} height={1152} className="h-full w-full object-cover" />
            )}
          </div>
          <div className="mt-4 flex gap-3">
            {p.has3d && (
              <button
                onClick={() => setActive(-1)}
                aria-label="3D view"
                className={cn("flex aspect-square w-20 items-center justify-center border bg-muted", active === -1 ? "border-foreground" : "border-transparent")}
              >
                <Box className="h-5 w-5" strokeWidth={1.3} />
              </button>
            )}
            {p.gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Image ${i + 1}`}
                className={cn("aspect-square w-20 overflow-hidden border", active === i ? "border-foreground" : "border-transparent")}
              >
                <img src={g} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="md:col-span-5 md:sticky md:top-28 md:self-start">
          <p className="eyebrow text-muted-foreground">VELORA · {p.category}</p>
          <h1 className="mt-4 font-serif text-6xl leading-[0.9] tracking-[-0.02em] md:text-7xl">{p.name}</h1>
          <div className="mt-5 flex items-center gap-3 text-sm">
            <span className="flex gap-0.5 text-champagne">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            <span>
              {p.rating} · {p.reviews} reviews
            </span>
          </div>
          <div className="mt-8 flex items-baseline justify-between border-y border-border py-5">
            <span className="font-serif text-4xl">{formatINR(p.price)}</span>
            <span className="eyebrow">{p.size}</span>
          </div>
          <p className="mt-6 leading-relaxed text-muted-foreground">{p.short}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {p.benefits.map((b) => (
              <li key={b} className="eyebrow border border-border px-3 py-2">
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center border border-border">
              <button aria-label="Decrease quantity" className="p-3.5" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
              <button aria-label="Increase quantity" className="p-3.5" onClick={() => setQty((q) => q + 1)}>
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <VButton className="flex-1" onClick={() => { add(p.slug, qty); toast.success(`${p.name} added to your bag`); }}>
              Add to bag
            </VButton>
          </div>
          <VButton
            variant="outline"
            className="mt-3 w-full"
            onClick={() => {
              add(p.slug, qty);
              toast("Checkout isn't connected yet — your bag is saved.");
            }}
          >
            Buy now
          </VButton>

          <Accordion type="single" collapsible defaultValue="description" className="mt-10">
            {[
              { v: "description", t: "Description", c: p.description },
              { v: "ingredients", t: "Ingredients", c: p.ingredients },
              { v: "how", t: "How to use", c: p.howTo },
              { v: "shipping", t: "Shipping", c: "Complimentary shipping across India on orders over ₹2,000. Dispatched within 24 hours." },
              { v: "returns", t: "Returns", c: "Not right for your skin? Return within 30 days, even if opened." },
            ].map((s) => (
              <AccordionItem key={s.v} value={s.v}>
                <AccordionTrigger className="eyebrow py-5 hover:no-underline">{s.t}</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">{s.c}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Frequently bought together */}
      <section className="mt-32 bg-plum px-[5vw] py-24 text-ivory">
        <p className="eyebrow opacity-60">Frequently bought together</p>
        <div className="mt-10 flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            {bundle.map((b, i) => (
              <div key={b.slug} className="flex items-center gap-4 md:gap-6">
                {i > 0 && <Plus className="h-4 w-4 opacity-60" />}
                <Link to="/product/$slug" params={{ slug: b.slug }} className="block w-24 md:w-40" data-cursor="view">
                  <img src={b.img} alt={b.name} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                  <p className="mt-3 font-serif text-lg leading-tight md:text-xl">{b.name}</p>
                </Link>
              </div>
            ))}
          </div>
          <div className="md:text-right">
            <p className="font-serif text-5xl">{formatINR(bundleTotal)}</p>
            <VButton
              variant="ivory"
              className="mt-6"
              onClick={() => {
                bundle.forEach((b) => add(b.slug, 1));
                toast.success("The ritual set was added to your bag");
              }}
            >
              Add all three
            </VButton>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="px-[5vw] py-28">
        <div className="flex items-end justify-between border-b border-border pb-8">
          <h2 className="font-serif text-5xl md:text-6xl">
            Customer <em className="text-plum">reviews</em>
          </h2>
          <p className="font-serif text-3xl">{p.rating} / 5</p>
        </div>
        <div className="mt-12 grid gap-12 md:grid-cols-3">
          {reviews.slice(0, 3).map((r) => (
            <article key={r.name}>
              <span className="flex gap-0.5 text-champagne">
                {Array.from({ length: r.rating }).map((_, s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-current" />
                ))}
              </span>
              <p className="mt-5 font-serif text-2xl leading-snug">“{r.text}”</p>
              <p className="eyebrow mt-6 text-muted-foreground">
                {r.name} — {r.city} · Verified buyer
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* You may also like */}
      <section className="border-t border-border px-[5vw] py-28">
        <h2 className="font-serif text-5xl md:text-6xl">
          You may <em className="text-plum">also like</em>
        </h2>
        <div className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {others.slice(0, 3).map((o) => (
            <ProductCard key={o.slug} p={o} />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
