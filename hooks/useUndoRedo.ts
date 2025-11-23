import { useState, useCallback, useRef } from 'react';

interface UseUndoRedoOptions<T> {
  initialState: T;
  maxHistorySize?: number; // 履歴の最大サイズ（デフォルト: 50）
}

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

/**
 * Undo/Redo機能を提供するカスタムフック
 */
export function useUndoRedo<T>({ initialState, maxHistorySize = 50 }: UseUndoRedoOptions<T>) {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // 初期化フラグ（初回レンダリング時の履歴追加を防ぐ）
  const isInitialized = useRef(false);

  // 状態を設定（履歴に追加）
  const set = useCallback((newState: T) => {
    setState(currentState => {
      // 現在の状態をpastに追加
      const newPast = [...currentState.past, currentState.present];

      // 履歴サイズを制限
      const trimmedPast = newPast.length > maxHistorySize
        ? newPast.slice(newPast.length - maxHistorySize)
        : newPast;

      return {
        past: trimmedPast,
        present: newState,
        future: [], // 新しい変更を加えたらfutureはクリア
      };
    });
  }, [maxHistorySize]);

  // Undo
  const undo = useCallback(() => {
    setState(currentState => {
      if (currentState.past.length === 0) {
        return currentState; // Undoできない
      }

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
  }, []);

  // Redo
  const redo = useCallback(() => {
    setState(currentState => {
      if (currentState.future.length === 0) {
        return currentState; // Redoできない
      }

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // 履歴をクリア
  const clear = useCallback(() => {
    setState(currentState => ({
      past: [],
      present: currentState.present,
      future: [],
    }));
  }, []);

  // 現在の状態を履歴に追加せずに設定（初期化用）
  const reset = useCallback((newState: T) => {
    setState({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    clear,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
