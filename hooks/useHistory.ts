
import { useState, useCallback } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: []
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    setState(currentState => {
      if (currentState.past.length === 0) return currentState;

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(currentState => {
      if (currentState.future.length === 0) return currentState;

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  const pushState = useCallback((newState: T) => {
    console.log('[useHistory] pushState called with pages:', (newState as any).pages?.length);
    setState(currentState => {
      if (JSON.stringify(currentState.present) === JSON.stringify(newState)) {
        console.log('[useHistory] pushState: state unchanged, skipping');
        return currentState;
      }

      console.log('[useHistory] pushState: updating state, new pages:', (newState as any).pages?.length);
      return {
        past: [...currentState.past, currentState.present],
        present: newState,
        future: []
      };
    });
  }, []);

  const updateCurrent = useCallback((newState: T) => {
    setState(currentState => ({
      ...currentState,
      present: newState
    }));
  }, []);

  return {
    state: state.present,
    pushState, // Use for actions that should be undoable (Mouse Up)
    updateCurrent, // Use for actions that are in-progress (Drag)
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory: (newState: T) => setState({ past: [], present: newState, future: [] })
  };
}
