import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark'; // 'light' is for dark backgrounds (like the footer), 'dark' is for light backgrounds
  monogramOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'dark',
  monogramOnly = false,
}) => {
  const isLight = variant === 'light';

  return (
    <Link to="/" className={`inline-flex items-center gap-3 group focus:outline-none ${className}`}>
      {/* Monogram */}
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
        >
          <rect width="64" height="64" rx="14" fill="#14342B" />
          <path
            d="M 18 28 L 32 17 L 46 28"
            fill="none"
            stroke="#B8893B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="32"
            y="47"
            textAnchor="middle"
            fontFamily="Fraunces, Georgia, serif"
            fontWeight="700"
            fontSize="15"
            fill="#B8893B"
            letterSpacing="1"
          >
            K&amp;M
          </text>
        </svg>
      </div>

      {/* Wordmark */}
      {!monogramOnly && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-serif text-lg md:text-xl font-bold tracking-tight transition-colors ${
              isLight ? 'text-white group-hover:text-brand-accent-light' : 'text-brand-primary group-hover:text-brand-primary-light'
            }`}
          >
            Kiragu &amp; Mwangi
          </span>
          <span
            className={`text-[9px] uppercase tracking-[0.22em] font-medium mt-1 ${
              isLight ? 'text-brand-accent' : 'text-brand-accent'
            }`}
          >
            Real Estate &middot; Valuation
          </span>
        </div>
      )}
    </Link>
  );
};
