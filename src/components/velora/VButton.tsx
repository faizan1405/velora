import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const vbutton = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden px-6 py-4 text-[0.7rem] font-medium uppercase tracking-[0.24em] transition-colors duration-300 disabled:opacity-50 before:absolute before:inset-0 before:origin-bottom before:scale-y-0 before:transition-transform before:duration-500 before:ease-[cubic-bezier(.7,0,.2,1)] hover:before:scale-y-100 [&>*]:relative",
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground before:bg-noir",
        outline: "border border-current bg-transparent before:bg-current/10",
        ivory: "bg-ivory text-noir before:bg-champagne",
      },
    },
    defaultVariants: { variant: "solid" },
  },
);

export interface VButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof vbutton> {}

export const VButton = forwardRef<HTMLButtonElement, VButtonProps>(({ className, variant, children, ...props }, ref) => (
  <button ref={ref} className={cn(vbutton({ variant }), className)} {...props}>
    <span>{children}</span>
  </button>
));
VButton.displayName = "VButton";
