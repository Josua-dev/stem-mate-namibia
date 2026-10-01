import React from 'react';

export const AppShell: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
};