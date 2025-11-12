import Image from 'next/image';

interface MinecraftAvatarProps {
  uuid: string;
  mcid: string;
  size?: number;
  className?: string;
}

export function MinecraftAvatar({ uuid, mcid, size = 64, className = '' }: MinecraftAvatarProps) {
  // Crafatar API を使用してスキンの顔部分を取得
  // https://crafatar.com/ - Minecraft スキンレンダリングサービス
  // overlay パラメータで帽子などのオーバーレイレイヤーも含める
  const avatarUrl = `https://crafatar.com/avatars/${uuid}?size=${size}&overlay`;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={avatarUrl}
        alt={`${mcid} のスキン`}
        width={size}
        height={size}
        className="pixelated"
        style={{ imageRendering: 'pixelated' }}
        unoptimized
      />
    </div>
  );
}
