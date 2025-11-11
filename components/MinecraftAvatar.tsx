'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface MinecraftAvatarProps {
  uuid: string;
  mcid: string;
  size?: number;
}

export function MinecraftAvatar({
  uuid,
  mcid,
  size = 64
}: MinecraftAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    drawAvatar();
  }, [uuid, size]);

  async function drawAvatar() {
    if (!canvasRef.current) return;

    try {
      // Mojang APIからスキン情報取得
      const profileRes = await fetch(
        `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
      );

      if (!profileRes.ok) throw new Error('Profile not found');

      const profileData = await profileRes.json();
      const texturesData = JSON.parse(
        atob(profileData.properties[0].value)
      );
      const skinUrl = texturesData.textures.SKIN.url;

      // スキン画像を読み込み
      const img = new window.Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        canvas.width = size;
        canvas.height = size;

        // アンチエイリアス無効化（ピクセルアート用）
        ctx.imageSmoothingEnabled = false;

        // ベースレイヤー（顔）: テクスチャの (8, 8) から 8x8 ピクセル
        ctx.drawImage(
          img,
          8, 8, 8, 8,      // ソース座標（顔の部分）
          0, 0, size, size // 描画先座標
        );

        // オーバーレイレイヤー（帽子）: テクスチャの (40, 8) から 8x8 ピクセル
        // 8%ほど大きく描画して、立体感を出す
        const overlayScale = 1.08; // 8%拡大
        const overlaySize = size * overlayScale;
        const offset = (overlaySize - size) / 2;

        ctx.drawImage(
          img,
          40, 8, 8, 8,                          // ソース座標（オーバーレイ部分）
          -offset, -offset,                      // 中央に配置するためのオフセット
          overlaySize, overlaySize              // 少し大きく描画
        );

        setAvatarUrl(canvas.toDataURL());
      };

      img.onerror = () => setError(true);
      img.src = skinUrl;

    } catch (err) {
      console.error('Failed to load skin:', err);
      setError(true);
    }
  }

  if (error) {
    return (
      <div
        className="bg-gray-300 flex items-center justify-center text-gray-600 font-bold"
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`${mcid}'s avatar`}
          width={size}
          height={size}
          className="pixelated"
        />
      ) : (
        <div
          className="bg-gray-200 animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
    </>
  );
}
