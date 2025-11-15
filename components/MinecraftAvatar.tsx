'use client';

import { useEffect, useRef, useState, memo } from 'react';

interface MinecraftAvatarProps {
  uuid: string;
  mcid: string;
  size?: number;
  className?: string;
}

// 画像キャッシュ（メモリ内）
const imageCache = new Map<string, string>();

const MinecraftAvatarComponent = ({ uuid, mcid, size = 64, className = '' }: MinecraftAvatarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observerで表示領域に入ったときのみ画像を読み込む
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // キャッシュチェック
    const cacheKey = `${uuid}-${size}`;
    const cached = imageCache.get(cacheKey);
    if (cached) {
      setImageData(cached);
      return;
    }

    const loadAndComposite = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // オーバーレイの拡大率
        const overlayScale = 1.05;

        // 拡大されたオーバーレイを含めるための作業用キャンバスサイズ
        const workSize = Math.ceil(size * overlayScale);
        const offset = (workSize - size) / 2;

        // 作業用キャンバスを作成（拡大したオーバーレイが収まるサイズ）
        const workCanvas = document.createElement('canvas');
        workCanvas.width = workSize;
        workCanvas.height = workSize;
        const workCtx = workCanvas.getContext('2d');
        if (!workCtx) return;

        // Crafatar APIでベース画像（オーバーレイなし）を取得
        const baseImg = new Image();
        baseImg.crossOrigin = 'anonymous';

        await new Promise<void>((resolve, reject) => {
          baseImg.onload = () => resolve();
          baseImg.onerror = () => reject(new Error('Failed to load base image'));
          baseImg.src = `https://crafatar.com/avatars/${uuid}?size=${size}&default=MHF_Steve`;
        });

        // Crafatar APIでオーバーレイ付き画像を取得
        const overlayImg = new Image();
        overlayImg.crossOrigin = 'anonymous';

        await new Promise<void>((resolve, reject) => {
          overlayImg.onload = () => resolve();
          overlayImg.onerror = () => reject(new Error('Failed to load overlay image'));
          overlayImg.src = `https://crafatar.com/avatars/${uuid}?size=${size}&overlay&default=MHF_Steve`;
        });

        // 作業用キャンバスにベース画像を中央に描画
        workCtx.imageSmoothingEnabled = false;
        workCtx.drawImage(baseImg, offset, offset, size, size);

        // 2つの画像を比較してオーバーレイ部分だけを抽出
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(overlayImg, 0, 0, size, size);

        // オーバーレイ付き画像のピクセルデータを取得
        const overlayData = tempCtx.getImageData(0, 0, size, size);

        tempCtx.clearRect(0, 0, size, size);
        tempCtx.drawImage(baseImg, 0, 0, size, size);
        const baseData = tempCtx.getImageData(0, 0, size, size);

        // 差分を計算してオーバーレイのみを抽出
        const overlayOnlyData = tempCtx.createImageData(size, size);
        let hasVisibleOverlay = false;

        for (let i = 0; i < overlayData.data.length; i += 4) {
          const overlayR = overlayData.data[i];
          const overlayG = overlayData.data[i + 1];
          const overlayB = overlayData.data[i + 2];
          const overlayA = overlayData.data[i + 3];

          const baseR = baseData.data[i];
          const baseG = baseData.data[i + 1];
          const baseB = baseData.data[i + 2];

          // オーバーレイとベースが異なる場合、そのピクセルはオーバーレイ部分
          if (overlayR !== baseR || overlayG !== baseG || overlayB !== baseB) {
            overlayOnlyData.data[i] = overlayR;
            overlayOnlyData.data[i + 1] = overlayG;
            overlayOnlyData.data[i + 2] = overlayB;
            overlayOnlyData.data[i + 3] = overlayA;
            if (overlayA > 0) hasVisibleOverlay = true;
          } else {
            overlayOnlyData.data[i + 3] = 0; // 透明にする
          }
        }

        // オーバーレイが存在する場合のみ拡大して描画
        if (hasVisibleOverlay) {
          tempCtx.clearRect(0, 0, size, size);
          tempCtx.putImageData(overlayOnlyData, 0, 0);

          // オーバーレイを拡大して作業用キャンバスの中央に配置
          const overlaySize = size * overlayScale;
          workCtx.drawImage(tempCanvas, 0, 0, size, size, 0, 0, overlaySize, overlaySize);
        }

        // 最終的な出力キャンバスに作業用キャンバス全体を描画
        canvas.width = workSize;
        canvas.height = workSize;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(workCanvas, 0, 0);

        // キャンバスの内容をデータURLに変換
        const dataUrl = canvas.toDataURL('image/png');

        // キャッシュに保存
        imageCache.set(cacheKey, dataUrl);
        setImageData(dataUrl);
      } catch (err) {
        console.error('Failed to composite avatar:', err);
        setError(true);
      }
    };

    loadAndComposite();
  }, [uuid, size, isVisible]);

  // エラー時はCrafatar APIのフォールバック
  if (error) {
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <img
          src={`https://crafatar.com/avatars/${uuid}?size=${size}&overlay&default=MHF_Steve`}
          alt={`${mcid} のスキン`}
          width={size}
          height={size}
          className="pixelated"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* 非表示のキャンバス（合成用） */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 合成結果を表示 */}
      {imageData ? (
        <img
          src={imageData}
          alt={`${mcid} のスキン`}
          width={size}
          height={size}
          className="pixelated"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        // ローディング中はプレースホルダー
        <div
          className="bg-gray-700 animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
    </div>
  );
};

export const MinecraftAvatar = memo(MinecraftAvatarComponent);
