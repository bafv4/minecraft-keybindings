/**
 * Simple loading spinner
 */
export function LoadingSpinner({
  size = 'md',
  variant = 'default',
}: {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light';
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const variantClasses = {
    default: 'border-muted-foreground/30 border-t-primary',
    light: 'border-white/30 border-t-white',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full animate-spin`}
    />
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
