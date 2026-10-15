import React from 'react';

interface ExcelLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  tagline?: string;
}

export const ExcelLogo: React.FC<ExcelLogoProps> = ({
  size = 30,
  className = '',
  showText = true,
  tagline = 'excel.dattasable.com',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none min-w-0 max-w-full overflow-hidden ${className}`}>
      {/* High-Definition SVG Icon Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logo-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="50%" stopColor="#166534" />
            <stop offset="100%" stopColor="#0F3820" />
          </linearGradient>
          <linearGradient id="logo-accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#86EFAC" />
          </linearGradient>
          <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#052E16" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Base Tile with Rounded Squircle */}
        <rect
          x="2"
          y="2"
          width="40"
          height="40"
          rx="11"
          fill="url(#logo-bg-grad)"
          stroke="#22C55E"
          strokeOpacity="0.4"
          strokeWidth="1.2"
          filter="url(#logo-glow)"
        />

        {/* Subtle Grid Lines inside tile */}
        <line x1="8" y1="16" x2="36" y2="16" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="8" y1="26" x2="36" y2="26" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="2 3" />

        {/* Left Side: Excel Symbol 'X' Plate */}
        <rect x="7" y="11" width="16" height="22" rx="4" fill="#0D5428" stroke="#34D399" strokeWidth="1" />
        <path d="M11 17L19 27M19 17L11 27" stroke="#F0FDF4" strokeWidth="2.4" strokeLinecap="round" />

        {/* Right Side: BI Analytics Rising Bars */}
        <rect x="26" y="24" width="3" height="9" rx="1.5" fill="#4ADE80" />
        <rect x="31" y="18" width="3" height="15" rx="1.5" fill="#86EFAC" />
        <rect x="36" y="13" width="3" height="20" rx="1.5" fill="#FFFFFF" />

        {/* Trend Pulse Overlay */}
        <path
          d="M21 23L27 19L32 22L38 12"
          stroke="url(#logo-accent-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="38" cy="12" r="1.8" fill="#FFFFFF" />
      </svg>

      {/* Brand Wordmark & Domain Badge - perfectly fitting & no overflow */}
      {showText && (
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="font-extrabold tracking-tight text-white flex items-center text-[15px] font-heading truncate">
            Excel<span className="text-[#86efac]">Dashboards</span>
          </span>
          <span className="text-[8.5px] font-mono tracking-wider uppercase text-[#8da69d] font-medium truncate mt-0.5">
            {tagline}
          </span>
        </div>
      )}
    </div>
  );
};
