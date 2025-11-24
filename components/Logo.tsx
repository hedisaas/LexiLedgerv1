import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'full' | 'icon' | 'text';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'medium',
  variant = 'full' 
}) => {
  const sizes = {
    small: { width: 160, height: 50, iconSize: 32 },
    medium: { width: 220, height: 70, iconSize: 44 },
    large: { width: 280, height: 90, iconSize: 56 }
  };

  const { width, height, iconSize } = sizes[size];

  // Icon only (book symbol)
  if (variant === 'icon') {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={className}
        style={{ width: iconSize, height: iconSize }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Book pages */}
        <path 
          d="M20 25 L50 15 L50 75 L20 85 Z" 
          fill="#2C7A7B" 
          opacity="0.9"
        />
        <path 
          d="M50 15 L80 25 L80 85 L50 75 Z" 
          fill="#4FD1C5" 
          opacity="0.9"
        />
        {/* Center binding */}
        <rect x="48" y="15" width="4" height="60" fill="#1A365D" opacity="0.3"/>
        {/* Shadow effect */}
        <path 
          d="M50 75 L20 85 L20 90 L50 80 Z" 
          fill="#718096" 
          opacity="0.3"
        />
        <path 
          d="M50 75 L80 85 L80 90 L50 80 Z" 
          fill="#4A5568" 
          opacity="0.3"
        />
      </svg>
    );
  }

  // Text only
  if (variant === 'text') {
    return (
      <div className={`font-bold tracking-tight ${className}`}>
        <span style={{ color: '#1A365D', fontSize: iconSize * 0.6 }}>LEXI</span>
        <span style={{ color: '#4FD1C5', fontSize: iconSize * 0.6 }}>LEDGER</span>
      </div>
    );
  }

  // Full logo (icon + text)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon */}
      <svg 
        viewBox="0 0 100 100" 
        style={{ width: iconSize, height: iconSize, flexShrink: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M20 25 L50 15 L50 75 L20 85 Z" 
          fill="#2C7A7B" 
          opacity="0.9"
        />
        <path 
          d="M50 15 L80 25 L80 85 L50 75 Z" 
          fill="#4FD1C5" 
          opacity="0.9"
        />
        <rect x="48" y="15" width="4" height="60" fill="#1A365D" opacity="0.3"/>
        <path 
          d="M50 75 L20 85 L20 90 L50 80 Z" 
          fill="#718096" 
          opacity="0.3"
        />
        <path 
          d="M50 75 L80 85 L80 90 L50 80 Z" 
          fill="#4A5568" 
          opacity="0.3"
        />
      </svg>
      
      {/* Text */}
      <div className="font-bold tracking-tight" style={{ fontSize: iconSize * 0.5 }}>
        <span style={{ color: '#1A365D' }}>LEXI</span>
        <span style={{ color: '#4FD1C5' }}>LEDGER</span>
      </div>
    </div>
  );
};

export default Logo;

