'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export function MigrationBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-blue-600 text-white px-4 py-3 shadow-md fixed top-[60px] md:top-[72px] left-0 right-0 z-40">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 text-sm md:text-base">
          <strong className="font-bold">📢 新アプリ「Minefolio」を公開しました！</strong>
          <span className="ml-2">
            今後は新しいアプリをご利用ください。
            <a
              href="https://minefolio.app"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline font-semibold hover:text-blue-100 transition-colors"
            >
              Minefolioはこちら →
            </a>
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 p-1 hover:bg-blue-700 rounded transition-colors"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
