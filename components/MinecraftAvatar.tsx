'use client';

import { useState, memo } from 'react';
import Image from 'next/image';

interface MinecraftAvatarProps {
  uuid: string;
  mcid: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

const MinecraftAvatarComponent = ({
  uuid,
  mcid,
  size = 64,
  className = '',
  priority = false
}: MinecraftAvatarProps) => {
  const [imgError, setImgError] = useState(false);

  // Next.jsのAPIルート経由で画像を取得（CORSを回避）
  const imageUrl = `/api/avatar?uuid=${uuid}&size=${size}`;
  const fallbackUrl = `/api/avatar?uuid=8667ba71b85a4004af54457a9734eed7&size=${size}`; // Steve

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={imgError ? fallbackUrl : imageUrl}
        alt={`${mcid} のスキン`}
        width={size}
        height={size}
        className="pixelated"
        style={{ imageRendering: 'pixelated' }}
        onError={() => setImgError(true)}
        unoptimized
        priority={priority}
      />
    </div>
  );
};

export const MinecraftAvatar = memo(MinecraftAvatarComponent);
