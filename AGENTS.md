<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- Homepage film: one persistent R3F canvas inside a sticky stage (`src/components/home/Story.tsx`); a single scrubbed GSAP master timeline writes to the mutable `S` object in `src/lib/story.ts`, and the scene reads it in `useFrame`. Why: one choreography source keeps camera, product, light and copy in sync and reversible.
- Canvas renders continuously only on high-quality devices (for subtle idle float); low-quality devices use `frameloop="demand"` and DOM code requests frames via `sceneBus.invalidate()`. Why: premium micro-motion without draining weak GPUs.
- Homepage choreography is written as sequential full-composition `shot()` keyframes in the master timeline; never overlap two shots in time. Why: prevents tweens fighting over the same camera/product property.
- Stage layers: background → back typography/imagery → canvas → front copy. Why: lets type sit behind the bottle for real depth.
- The bottle is procedural (`SerumBottle.tsx`) with named part groups; swap meshes for a GLB later without touching the timeline. Why: explode choreography only moves groups.
- Lenis drives scroll and feeds ScrollTrigger (`SmoothScroll.tsx`); no ScrollTrigger pinning, sticky CSS instead. Why: avoids pin/Lenis conflicts.
- Never use drei `<Environment preset>`; use local Lightformers. Why: presets fetch remote HDRs and can hang Suspense.
- Cart is client-side zustand persisted to localStorage with manual rehydrate. Why: no backend yet and avoids hydration mismatches.
