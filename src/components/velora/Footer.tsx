import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-plum px-[5vw] pb-10 pt-24 text-ivory">
      <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
        <p className="max-w-md font-serif text-3xl leading-tight md:text-4xl">
          Skincare, <em className="text-champagne">distilled</em> to its essence.
        </p>
        <nav className="eyebrow flex gap-8 opacity-80">
          <Link to="/shop">Shop</Link>
          <Link to="/science">Science</Link>
          <Link to="/about">About</Link>
        </nav>
      </div>
      <p className="mt-16 font-serif text-[26vw] leading-[0.75] tracking-[-0.04em] text-ivory/90">VELORA</p>
      <div className="eyebrow mt-8 flex justify-between opacity-50">
        <span>© 2026 VELORA</span>
        <span>Made in India</span>
      </div>
    </footer>
  );
}
