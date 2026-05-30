import { useCallback, useMemo, useReducer } from "react";
import type { ArchitectureModel } from "../types/architecture";
import { architectureReducer, initialState } from "../state/architectureReducer";
import { canRedo, canUndo } from "../state/historyStack";

const EMPTY: ArchitectureModel = { nodes: [], edges: [], groups: [] };

export type SetModelOpts = { record?: boolean };

export function useArchitecture(initial: ArchitectureModel = EMPTY) {
  const [state, dispatch] = useReducer(architectureReducer, initial, initialState);

  const setModel = useCallback((model: ArchitectureModel, opts: SetModelOpts = {}) => {
    dispatch({ type: "set", model, record: opts.record ?? true });
  }, []);

  const updateModel = useCallback(
    (updater: (model: ArchitectureModel) => ArchitectureModel, opts: SetModelOpts = {}) => {
      dispatch({ type: "update", updater, record: opts.record ?? true });
    },
    []
  );

  const resetModel = useCallback((model: ArchitectureModel) => {
    dispatch({ type: "reset", model });
  }, []);

  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  const flags = useMemo(
    () => ({ canUndo: canUndo(state.history), canRedo: canRedo(state.history) }),
    [state.history]
  );

  return { model: state.model, setModel, updateModel, resetModel, undo, redo, ...flags };
}
