import React from 'react'

// Arengcon actual logo image
const LogoIcon = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <img
    src="/logo.png"
    alt="Arengcon logo"
    className={className}
    style={{ display: 'block', objectFit: 'contain', ...style }}
  />
)

export default LogoIcon
