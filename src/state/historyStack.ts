export type History<T> = { past: T[]; future: T[]; limit: number };

export function emptyHistory<T>(limit = 50): History<T> {
  return { past: [], future: [], limit };
}

export function push<T>(history: History<T>, snapshot: T): History<T> {
  const past = [...history.past, snapshot];
  return {
    past: past.length > history.limit ? past.slice(past.length - history.limit) : past,
    future: [],
    limit: history.limit
  };
}

export function canUndo<T>(history: History<T>) {
  return history.past.length > 0;
}

export function canRedo<T>(history: History<T>) {
  return history.future.length > 0;
}
