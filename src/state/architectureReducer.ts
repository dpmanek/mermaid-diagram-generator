import type { ArchitectureModel } from "../types/architecture";
import { emptyHistory, push, type History } from "./historyStack";

export type ArchitectureState = {
  model: ArchitectureModel;
  history: History<ArchitectureModel>;
};

export type ArchitectureAction =
  | { type: "set"; model: ArchitectureModel; record: boolean }
  | { type: "update"; updater: (model: ArchitectureModel) => ArchitectureModel; record: boolean }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; model: ArchitectureModel };

export function initialState(model: ArchitectureModel): ArchitectureState {
  return { model, history: emptyHistory<ArchitectureModel>(50) };
}

export function architectureReducer(state: ArchitectureState, action: ArchitectureAction): ArchitectureState {
  switch (action.type) {
    case "set": {
      if (action.record) return { model: action.model, history: push(state.history, state.model) };
      return { ...state, model: action.model };
    }
    case "update": {
      const nextModel = action.updater(state.model);
      if (action.record) return { model: nextModel, history: push(state.history, state.model) };
      return { ...state, model: nextModel };
    }
    case "undo": {
      const past = state.history.past;
      if (!past.length) return state;
      const previous = past[past.length - 1];
      return {
        model: previous,
        history: {
          ...state.history,
          past: past.slice(0, -1),
          future: [state.model, ...state.history.future]
        }
      };
    }
    case "redo": {
      const future = state.history.future;
      if (!future.length) return state;
      const next = future[0];
      return {
        model: next,
        history: {
          ...state.history,
          past: [...state.history.past, state.model],
          future: future.slice(1)
        }
      };
    }
    case "reset": {
      return initialState(action.model);
    }
  }
}
