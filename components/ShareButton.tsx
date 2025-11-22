'use client';

import { useState } from 'react';
import { Share2, Link2, Download, Check } from 'lucide-react';

interface ShareButtonProps {
  mcid: string;
}

export function ShareButton({ mcid }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const ogImageUrl = `/player/${mcid}/opengraph-image`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(ogImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${mcid}-keybindings.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="共有"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close menu when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">コピーしました！</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  <span className="text-sm">リンクをコピー</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadImage}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left border-t border-border"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">画像をダウンロード</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
