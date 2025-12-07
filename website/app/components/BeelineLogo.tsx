'use client';

interface BeelineLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function BeelineLogo({ size = 'md', showText = true, className = '' }: BeelineLogoProps) {
  const sizes = {
    sm: {
      hexagon: 'w-6 h-6',
      letter: 'text-xs',
      text: 'text-lg',
      gap: 'gap-1.5',
    },
    md: {
      hexagon: 'w-8 h-8',
      letter: 'text-sm',
      text: 'text-2xl',
      gap: 'gap-2',
    },
    lg: {
      hexagon: 'w-10 h-10',
      letter: 'text-base',
      text: 'text-3xl',
      gap: 'gap-3',
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`inline-flex items-center ${sizeConfig.gap} ${className}`}>
      {/* Hexagon Icon */}
      <div className={`relative ${sizeConfig.hexagon} animate-float`}>
        <div
          className="w-full h-full bg-gradient-beeline flex items-center justify-center"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          }}
        >
          <span className={`${sizeConfig.letter} font-bold text-black font-mono`}>B</span>
        </div>
      </div>

      {/* Text */}
      {showText && (
        <span
          className={`${sizeConfig.text} font-bold bg-gradient-beeline bg-clip-text text-transparent tracking-tight`}
        >
          Beeline
        </span>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
