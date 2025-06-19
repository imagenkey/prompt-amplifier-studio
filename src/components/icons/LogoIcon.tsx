import React from 'react';

const LogoIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
    aria-label="Prompt Amplifier Logo"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
    <line x1="12" y1="22" x2="12" y2="17" />
    <line x1="12" y1="12" x2="12" y2="7" />
    <line x1="20" y1="14.5" x2="20" y2="9.5" />
    <line x1="4" y1="14.5" x2="4" y2="9.5" />
  </svg>
);

export default LogoIcon;
