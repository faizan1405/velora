import { create } from "zustand";

export type CursorMode = "default" | "hover" | "view" | "drag";

type UIState = {
  sceneReady: boolean;
  noWebgl: boolean;
  loaded: boolean;
  buyActive: boolean;
  navSolid: boolean;
  cursor: CursorMode;
  set: (p: Partial<Omit<UIState, "set">>) => void;
};

export const useUI = create<UIState>((set) => ({
  sceneReady: false,
  noWebgl: false,
  loaded: false,
  buyActive: false,
  navSolid: false,
  cursor: "default",
  set: (p) => set(p),
}));
