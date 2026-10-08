/**
 * Shared, mutable scene state for the homepage film.
 * GSAP's master timeline writes to `S`; the WebGL scene reads it every frame.
 * Nothing here triggers React renders.
 */
export const PALETTE = {
  black: "#111111",
  ivory: "#F4F0E8",
  skin: "#E5C6B8",
  plum: "#401D32",
  champagne: "#C8AD85",
} as const;

export const INITIAL = {
  progress: 0,
  intro: 0,
  camX: 0,
  camY: 0,
  camZ: 7,
  tgtX: 0,
  tgtY: 0,
  tgtZ: 0,
  bX: 0,
  bY: -0.1,
  bZ: 0,
  bRotX: 0,
  bRotY: -0.4,
  bRotZ: 0,
  bScale: 1,
  explode: 0,
  ingredients: 0,
  orbit: 0,
  droplets: 0,
  particles: 0.35,
  key: 1,
  rimHue: 0,
  ambient: 0.25,
  fov: 32,
  rim: 1.6,
  warm: 0.5,
  lift: 0,
  drop: 0,
};

export type StoryState = typeof INITIAL;

export const S: StoryState = { ...INITIAL };

export const mouse = { x: 0, y: 0, sx: 0, sy: 0 };

export const drag = { active: false, rot: 0, vel: 0, lastX: 0 };

/** Bridge so DOM-side code can request a frame from the on-demand canvas. */
export const sceneBus = {
  invalidate: () => {},
};

export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
