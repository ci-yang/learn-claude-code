import type { TutorialSession } from "./types";

// Lazy import map for all sessions
const tutorialModules: Record<string, () => Promise<{ default: TutorialSession }>> = {
  s01: () => import("./s01"),
  s02: () => import("./s02"),
  s03: () => import("./s03"),
  s04: () => import("./s04"),
  s05: () => import("./s05"),
  s06: () => import("./s06"),
  s07: () => import("./s07"),
  s08: () => import("./s08"),
  s09: () => import("./s09"),
  s10: () => import("./s10"),
  s11: () => import("./s11"),
  s12: () => import("./s12"),
};

export async function loadTutorial(session: string): Promise<TutorialSession | null> {
  const loader = tutorialModules[session];
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod.default;
  } catch {
    return null;
  }
}

export type { TutorialSession, TutorialStep, TutorialConcept } from "./types";
