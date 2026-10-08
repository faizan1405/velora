import { useEffect, useRef, useState } from "react";
import { useUI, type CursorMode } from "@/lib/ui-store";

/** Desktop-only custom cursor. Elements can opt into labels via data-cursor="view|drag". */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState<CursorMode>("default");
  const sceneMode = useUI((s) => s.cursor);
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 768;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");
    const pos = { x: -100, y: -100, tx: -100, ty: -100 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      pos.tx = e.clientX;
      pos.ty = e.clientY;
    };
    const onOver = (e: MouseEvent) => {
      const t = (e.target as Element | null)?.closest?.("[data-cursor],a,button,input,select,[role=button]");
      if (!t) return setHover("default");
      const m = t.getAttribute("data-cursor") as CursorMode | null;
      setHover(m ?? "hover");
    };
    const loop = () => {
      pos.x += (pos.tx - pos.x) * 0.22;
      pos.y += (pos.ty - pos.y) * 0.22;
      if (el.current) el.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  if (!enabled) return null;
  const mode: CursorMode = sceneMode === "drag" ? "drag" : hover;
  const size = mode === "default" ? 10 : mode === "hover" ? 44 : 78;
  const label = mode === "view" ? "View" : mode === "drag" ? "Drag" : "";

  return (
    <div ref={el} className="pointer-events-none fixed left-0 top-0 z-[200] mix-blend-difference">
      <div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-noir transition-[width,height] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]"
        style={{ width: size, height: size }}
      >
        {label && <span className="eyebrow text-[0.6rem]">{label}</span>}
      </div>
    </div>
  );
}
