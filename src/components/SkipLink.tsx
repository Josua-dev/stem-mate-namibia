import React from 'react';

export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only sr-only-focusable"
    >
      Skip to main content
    </a>
  );
};