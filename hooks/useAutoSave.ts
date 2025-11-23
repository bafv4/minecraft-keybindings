import { useEffect, useCallback, useRef } from 'react';

interface UseAutoSaveOptions {
  key: string; // ローカルストレージのキー
  data: any; // 保存するデータ
  delay?: number; // デバウンス遅延（ミリ秒）
  enabled?: boolean; // 自動保存を有効にするか
}

/**
 * ローカルストレージに自動保存するカスタムフック
 * データの変更を検知して自動的にローカルストレージに保存します
 */
export function useAutoSave({ key, data, delay = 1000, enabled = true }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  // データをローカルストレージに保存
  const save = useCallback((dataToSave: any) => {
    try {
      const serialized = JSON.stringify(dataToSave);
      localStorage.setItem(key, serialized);
      localStorage.setItem(`${key}_timestamp`, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [key]);

  // ローカルストレージからデータを読み込み
  const load = useCallback(() => {
    try {
      const serialized = localStorage.getItem(key);
      const timestamp = localStorage.getItem(`${key}_timestamp`);

      if (serialized) {
        return {
          data: JSON.parse(serialized),
          timestamp: timestamp ? new Date(timestamp) : null,
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }, [key]);

  // ローカルストレージをクリア
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, [key]);

  // データの変更を監視して自動保存
  useEffect(() => {
    // 初回レンダリング時はスキップ（初期値の保存を防ぐ）
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 自動保存が無効の場合はスキップ
    if (!enabled) {
      return;
    }

    // 既存のタイムアウトをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // デバウンス処理: 指定時間後に保存
    timeoutRef.current = setTimeout(() => {
      save(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  return {
    save: () => save(data), // 手動保存
    load, // 読み込み
    clear, // クリア
  };
}
