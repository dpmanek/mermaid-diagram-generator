import { useEffect, useRef } from "react";
import type { ArchitectureProject } from "../types/architecture";
import { STORAGE_KEYS } from "../state/storageKeys";

const SAVE_DEBOUNCE_MS = 400;

export function loadProject(): ArchitectureProject | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.project);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as ArchitectureProject;
    if (!parsed?.model || !Array.isArray(parsed.model.nodes)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export function usePersistence(project: ArchitectureProject) {
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.project, JSON.stringify(project));
      } catch {
        // quota or serialization error — ignore
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [project]);
}

export function clearStoredProject() {
  try {
    localStorage.removeItem(STORAGE_KEYS.project);
  } catch {
    // ignore
  }
}
