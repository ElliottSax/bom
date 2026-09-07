import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string;
  height?: string;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}) => {
  const baseClasses =
    'animate-pulse bg-gradient-to-r from-[var(--color-bg-tertiary)] via-[var(--color-border)] to-[var(--color-bg-tertiary)] bg-[length:200%_100%]';

  const variantClasses = {
    text: 'rounded h-4',
    rect: 'rounded-xl',
    circle: 'rounded-full',
  };

  const skeletonStyle = {
    width: width || (variant === 'text' ? '100%' : 'auto'),
    height: height || (variant === 'text' ? '1rem' : 'auto'),
  };

  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={skeletonStyle}
      aria-hidden="true"
    />
  ));

  return count > 1 ? <div className="space-y-2">{elements}</div> : elements[0];
};

// Preset skeleton components for common use cases
export const VerseSkeleton: React.FC = () => (
  <div className="py-2 px-4 space-y-2">
    <LoadingSkeleton variant="text" width="10%" height="1rem" />
    <LoadingSkeleton variant="text" width="100%" height="0.875rem" />
    <LoadingSkeleton variant="text" width="95%" height="0.875rem" />
    <LoadingSkeleton variant="text" width="80%" height="0.875rem" />
  </div>
);

export const ChapterGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2 p-6">
    {Array.from({ length: 20 }, (_, i) => (
      <LoadingSkeleton key={i} variant="rect" width="100%" height="2.5rem" />
    ))}
  </div>
);

export const SearchResultSkeleton: React.FC = () => (
  <div className="p-4 space-y-2">
    <LoadingSkeleton variant="text" width="30%" height="0.875rem" />
    <LoadingSkeleton variant="text" width="100%" height="0.875rem" />
    <LoadingSkeleton variant="text" width="85%" height="0.875rem" />
  </div>
);
