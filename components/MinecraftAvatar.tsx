'use client';

import { useState, memo } from 'react';

interface MinecraftAvatarProps {
  uuid: string;
  mcid: string;
  size?: number;
  className?: string;
}

const MinecraftAvatarComponent = ({ uuid, mcid, size = 64, className = '' }: MinecraftAvatarProps) => {
  const [imgError, setImgError] = useState(false);

  // Next.jsのAPIルート経由で画像を取得（CORSを回避）
  const imageUrl = `/api/avatar?uuid=${uuid}&size=${size}`;
  const fallbackUrl = `/api/avatar?uuid=8667ba71b85a4004af54457a9734eed7&size=${size}`; // Steve

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgError ? fallbackUrl : imageUrl}
        alt={`${mcid} のスキン`}
        width={size}
        height={size}
        className="pixelated"
        style={{ imageRendering: 'pixelated' }}
        onError={() => setImgError(true)}
      />
    </div>
  );
};

export const MinecraftAvatar = memo(MinecraftAvatarComponent);
