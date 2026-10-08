import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import { formatINR, type Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ProductCard({ p, index }: { p: Product; index?: number }) {
  const add = useCart((s) => s.add);
  const [wish, setWish] = useState(false);

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted" data-cursor="view">
        <Link to="/product/$slug" params={{ slug: p.slug }} className="absolute inset-0" aria-label={p.name}>
          <img
            src={p.img}
            alt={p.name}
            width={896}
            height={1152}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-[1.07]"
          />
          <img
            src={p.img2}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-[clip-path] duration-[900ms] ease-[cubic-bezier(.7,0,.2,1)] [clip-path:inset(100%_0_0_0)] group-hover:[clip-path:inset(0_0_0_0)]"
          />
        </Link>
        {typeof index === "number" && (
          <span className="eyebrow pointer-events-none absolute left-4 top-4 bg-background/80 px-2 py-1 text-foreground backdrop-blur">
            {String(index + 1).padStart(2, "0")} — {p.category}
          </span>
        )}
        <button
          aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => {
            setWish((w) => !w);
            toast(wish ? "Removed from wishlist" : "Saved to wishlist");
          }}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-all duration-500 md:translate-y-[-8px] md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          <Heart className={cn("h-4 w-4", wish && "fill-current text-plum")} strokeWidth={1.5} />
        </button>
        <button
          onClick={() => {
            add(p.slug, 1);
            toast.success(`${p.name} added to your bag`);
          }}
          className="eyebrow absolute inset-x-4 bottom-4 flex items-center justify-between bg-background px-4 py-3.5 text-foreground transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] hover:bg-primary hover:text-primary-foreground md:translate-y-[calc(100%+1.5rem)] md:group-hover:translate-y-0"
        >
          <span>Quick add</span>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <Link to="/product/$slug" params={{ slug: p.slug }} className="mt-5 block">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-2xl transition-transform duration-500 group-hover:translate-x-2 md:text-[1.7rem]">
            {p.name}
          </h3>
          <span className="text-sm tabular-nums">{formatINR(p.price)}</span>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{p.short}</p>
        <p className="eyebrow mt-3 text-muted-foreground">
          {p.size} · ★ {p.rating} ({p.reviews})
        </p>
      </Link>
    </article>
  );
}
