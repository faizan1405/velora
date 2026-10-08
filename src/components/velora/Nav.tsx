import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Search, User, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useUI } from "@/lib/ui-store";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export function Nav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navSolid = useUI((s) => s.navSolid);
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const solid = pathname !== "/" || navSolid;
  const count = mounted ? items.reduce((a, i) => a + i.qty, 0) : 0;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,color,border-color] duration-500",
        solid
          ? "border-b border-border bg-background/75 text-foreground backdrop-blur-xl"
          : "border-b border-transparent text-ivory mix-blend-difference",
      )}
    >
      <nav className="mx-auto flex h-16 items-center justify-between px-[5vw] md:h-20">
        <div className="flex flex-1 items-center gap-8">
          {[
            { to: "/shop", label: "Shop" },
            { to: "/science", label: "Science" },
            { to: "/about", label: "About" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="eyebrow hidden opacity-80 transition-opacity hover:opacity-100 md:inline"
              activeProps={{ className: "opacity-100 underline underline-offset-8" }}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/shop" className="eyebrow md:hidden">
            Shop
          </Link>
        </div>
        <Link to="/" className="font-serif text-2xl tracking-[0.18em] md:text-[1.7rem]">
          VELORA
        </Link>
        <div className="flex flex-1 items-center justify-end gap-5">
          <button aria-label="Search" className="hidden md:block" onClick={() => toast("Search is coming soon.")}>
            <Search className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button aria-label="Account" className="hidden md:block" onClick={() => toast("Accounts are coming soon.")}>
            <User className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button aria-label="Open bag" className="flex items-center gap-2" onClick={() => setOpen(true)}>
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            <span className="eyebrow tabular-nums">({count})</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
