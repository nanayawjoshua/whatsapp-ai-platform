import React from 'react';

interface BeelineLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showCursor?: boolean;
  theme?: 'light' | 'dark' | 'yellow';
}

const sizeMap = {
  sm: 'text-2xl',    // 24px
  md: 'text-4xl',    // 36px
  lg: 'text-6xl',    // 60px
  xl: 'text-8xl',    // 96px
};

const themeMap = {
  light: 'text-text-primary',
  dark: 'text-white',
  yellow: 'text-[#FFB800]',
};

export default function BeelineLogoNew({
  size = 'md',
  className = '',
  showCursor = true,
  theme = 'light'
}: BeelineLogoProps) {
  return (
    <div
      className={`font-mono font-semibold tracking-tight ${sizeMap[size]} ${themeMap[theme]} ${className}`}
      style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
    >
      beeline
      {showCursor && (
        <span
          className="text-[#FFB800] animate-blink ml-0.5"
          aria-hidden="true"
        >
          _
        </span>
      )}
    </div>
  );
}
