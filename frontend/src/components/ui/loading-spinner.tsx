import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-40 h-40', 
    lg: 'w-48 h-48'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <img
          src="https://res.cloudinary.com/dqv26p8im/image/upload/v1759807728/test_ydlihe.gif"
          alt="Loading..."
          className="w-full h-full object-contain"
        />
      </div>
      {message && (
        <p className="text-muted-foreground text-center animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

// Centered loading for full screen
export const CenteredLoading: React.FC<LoadingSpinnerProps> = (props) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner {...props} />
    </div>
  );
};

// Inline loading for smaller areas
export const InlineLoading: React.FC<LoadingSpinnerProps> = (props) => {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="sm" {...props} />
    </div>
  );
};
