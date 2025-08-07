import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-background" />
      
      {/* Floating orbs */}
      <div className="floating-orb orb-1 w-96 h-96 top-1/4 left-1/4" />
      <div className="floating-orb orb-2 w-80 h-80 top-3/4 right-1/4" />
      <div className="floating-orb orb-3 w-72 h-72 top-1/2 right-1/3" />
      <div className="floating-orb orb-1 w-64 h-64 bottom-1/4 left-1/3" />
      <div className="floating-orb orb-2 w-56 h-56 top-1/3 left-2/3" />
      
      {/* Additional smaller orbs for depth */}
      <div className="floating-orb orb-3 w-32 h-32 top-1/6 right-1/6 opacity-20" />
      <div className="floating-orb orb-1 w-24 h-24 bottom-1/3 right-2/3 opacity-25" />
      <div className="floating-orb orb-2 w-40 h-40 bottom-1/6 left-1/6 opacity-15" />
    </div>
  );
};