import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import { formatINR, getProduct } from "@/lib/products";
import { lenisStore } from "@/lib/lenis";
import { VButton } from "./VButton";

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove } = useCart();
  const lines = items
    .map((i) => ({ ...i, p: getProduct(i.slug) }))
    .filter((l): l is typeof l & { p: NonNullable<typeof l.p> } => !!l.p);
  const subtotal = lines.reduce((a, l) => a + l.p.price * l.qty, 0);

  useEffect(() => {
    if (open) lenisStore.lenis?.stop();
    else lenisStore.lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-[90] bg-noir/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-label="Your bag"
            className="fixed inset-y-0 right-0 z-[95] flex w-full max-w-md flex-col bg-background text-foreground"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            data-lenis-prevent
          >
            <div className="flex items-center justify-between border-b border-border px-7 py-6">
              <h2 className="font-serif text-3xl">Your bag</h2>
              <button aria-label="Close bag" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-7">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-serif text-2xl">Your bag is empty.</p>
                  <Link to="/shop" onClick={() => setOpen(false)} className="eyebrow mt-6 underline underline-offset-8">
                    Explore the collection
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {lines.map((l, i) => (
                    <motion.li
                      key={l.slug}
                      className="flex gap-5 py-6"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.06 }}
                    >
                      <img src={l.p.img} alt={l.p.name} className="h-28 w-22 shrink-0 object-cover" width={88} height={112} loading="lazy" />
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="font-serif text-xl leading-tight">{l.p.name}</p>
                            <p className="eyebrow mt-1 text-muted-foreground">{l.p.size}</p>
                          </div>
                          <p className="text-sm tabular-nums">{formatINR(l.p.price * l.qty)}</p>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border border-border">
                            <button aria-label="Decrease" className="p-2" onClick={() => setQty(l.slug, l.qty - 1)}>
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center text-sm tabular-nums">{l.qty}</span>
                            <button aria-label="Increase" className="p-2" onClick={() => setQty(l.slug, l.qty + 1)}>
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button className="eyebrow text-muted-foreground underline-offset-4 hover:underline" onClick={() => remove(l.slug)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-border px-7 py-6">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow">Subtotal</span>
                <span className="font-serif text-2xl tabular-nums">{formatINR(subtotal)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
              <VButton
                className="mt-5 w-full"
                disabled={lines.length === 0}
                onClick={() => toast("Checkout isn't connected yet — your bag is saved.")}
              >
                Checkout
              </VButton>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
