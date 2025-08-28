import React from 'react';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  colorClassName?: string;
};

const sizeMap: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', colorClassName = 'border-white' }) => {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-t-transparent ${sizeMap[size]} ${colorClassName}`}
      aria-label="Loading"
      role="status"
    />
  );
};

export default Spinner;


