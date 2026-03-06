import React from 'react'
// Arengcon geometric logo — abstract A + construction lines
const LogoIcon = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    aria-label="Arengcon logo"
  >
    {/* Outer square frame */}
    <rect x="2" y="2" width="76" height="76" stroke="currentColor" strokeWidth="1.5" />
    {/* Inner geometric A-shape */}
    <polygon
      points="40,12 68,68 12,68"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Crossbar on the A */}
    <line x1="24" y1="52" x2="56" y2="52" stroke="currentColor" strokeWidth="1.5" />
    {/* Vertical accent line top */}
    <line x1="40" y1="2" x2="40" y2="12" stroke="currentColor" strokeWidth="1.5" />
    {/* Small diamond center mark */}
    <rect
      x="36.5"
      y="36.5"
      width="7"
      height="7"
      transform="rotate(45 40 40)"
      stroke="currentColor"
      strokeWidth="1"
      fill="currentColor"
      opacity="0.6"
    />
  </svg>
)

export default LogoIcon
