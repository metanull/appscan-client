import React from 'react';

const Layout = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export default Layout;
