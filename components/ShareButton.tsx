'use client';

import { useState } from 'react';
import { Share2, Link2, Download, Check } from 'lucide-react';
import { DraggableModal } from './ui/DraggableModal';

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
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="共有"
      >
        <Share2 className="w-5 h-5" />
      </button>

      <DraggableModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="共有"
        subtitle="このページを共有する"
        maxWidth="md"
      >
        <div className="px-6 py-4 space-y-3">
          <button
            onClick={handleCopyLink}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors rounded-lg text-left border border-border"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-green-500">コピーしました！</span>
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">リンクをコピー</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadImage}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors rounded-lg text-left border border-border"
          >
            <Download className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">画像をダウンロード</span>
          </button>
        </div>
      </DraggableModal>
    </>
  );
}
