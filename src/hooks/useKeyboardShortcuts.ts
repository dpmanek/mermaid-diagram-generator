import { useEffect } from "react";

export type ShortcutHandlers = {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onRename: () => void;
};

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useKeyboardShortcuts({ onUndo, onRedo, onDelete, onCopy, onPaste, onDuplicate, onRename }: ShortcutHandlers) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const cmd = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (cmd && key === "z") {
        event.preventDefault();
        if (event.shiftKey) onRedo();
        else onUndo();
        return;
      }
      if (cmd && key === "y") {
        event.preventDefault();
        onRedo();
        return;
      }
      if (cmd && key === "c") {
        event.preventDefault();
        onCopy();
        return;
      }
      if (cmd && key === "v") {
        event.preventDefault();
        onPaste();
        return;
      }
      if (cmd && key === "d") {
        event.preventDefault();
        onDuplicate();
        return;
      }
      if (key === "f2") {
        event.preventDefault();
        onRename();
        return;
      }
      if (key === "delete" || key === "backspace") {
        event.preventDefault();
        onDelete();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCopy, onDelete, onDuplicate, onPaste, onRedo, onRename, onUndo]);
}
