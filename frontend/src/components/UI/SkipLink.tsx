import React from 'react';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const SkipLink: React.FC<SkipLinkProps> = ({ href, children, className = '' }) => {
  return (
    <a
      href={href}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        bg-primary text-white px-4 py-2 rounded-md z-50 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white
        transition-all duration-200
        ${className}
      `}
      onFocus={(e) => {
        // Ensure the skip link is visible when focused
        e.currentTarget.style.position = 'absolute';
        e.currentTarget.style.top = '1rem';
        e.currentTarget.style.left = '1rem';
      }}
    >
      {children}
    </a>
  );
};

export default SkipLink;