/**
 * Windows 11 style loading spinner
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const radiusMap = {
    sm: 12,
    md: 18,
    lg: 24,
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {[...Array(6)].map((_, i) => {
        const angle = i * 60;
        const radius = radiusMap[size];
        const x = Math.sin((angle * Math.PI) / 180) * radius;
        const y = -Math.cos((angle * Math.PI) / 180) * radius;

        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
          >
            <div
              className={`${dotSizeClasses[size]} rounded-full bg-primary animate-pulse-fade`}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.2s',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Full page loading component
 */
export function LoadingPage() {
  return (
    <div className="flex items-center justify-center py-24">
      <LoadingSpinner size="lg" />
    </div>
  );
}
