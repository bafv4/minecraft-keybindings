import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface UseBlockNavigationOptions {
  when: boolean; // ブロックする条件
  message?: string; // 警告メッセージ
  onBlock?: () => void; // ブロック時のコールバック
}

/**
 * ページ遷移をブロックするカスタムフック
 */
export function useBlockNavigation({ when, message = '変更内容が保存されていません。このまま移動しますか？', onBlock }: UseBlockNavigationOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const shouldBlockRef = useRef(when);

  // shouldBlockの状態を更新
  useEffect(() => {
    shouldBlockRef.current = when;
  }, [when]);

  // ブラウザのbeforeunloadイベントをハンドル
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlockRef.current) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [message]);

  // Next.jsのルーティングをインターセプト
  // 注意: Next.js App Routerではルーティングのインターセプトが制限されているため、
  // リンククリック時のハンドリングはコンポーネント側で行う必要があります
  const confirmNavigation = useCallback(() => {
    if (shouldBlockRef.current) {
      if (onBlock) {
        onBlock();
        return false; // ナビゲーションをブロック
      }
      return window.confirm(message);
    }
    return true; // ナビゲーションを許可
  }, [message, onBlock]);

  return {
    confirmNavigation,
    shouldBlock: when,
  };
}
