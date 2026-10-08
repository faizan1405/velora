import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = { slug: string; qty: number };

type CartState = {
  items: CartItem[];
  open: boolean;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  setOpen: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      add: (slug, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.slug === slug);
          const items = existing
            ? s.items.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty } : i))
            : [...s.items, { slug, qty }];
          return { items, open: true };
        }),
      setQty: (slug, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.slug === slug ? { ...i, qty: Math.max(1, qty) } : i)),
        })),
      remove: (slug) => set((s) => ({ items: s.items.filter((i) => i.slug !== slug) })),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "velora-bag",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      skipHydration: true,
    },
  ),
);
