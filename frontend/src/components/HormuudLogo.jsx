import React from 'react';

export default function HormuudLogo({ showText = true, size = 40, className = '' }) {
  // Brand color hexes directly matched from official assets
  const greenColor = '#3cb043';
  const blueColor = '#2ca033';

  return (
    <div className={`hormuud-logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {/* Crisp vector logo mark */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Main enclosing ring (with a gap at top right for the waves) */}
        <path 
          d="M 85,25 A 50,50 0 1,0 102.5,70" 
          stroke={greenColor} 
          strokeWidth="10" 
          strokeLinecap="round" 
          fill="none"
        />
        
        {/* The bold letter 'H' inside the circle */}
        <path 
          d="M 40,35 V 85 M 70,35 V 85 M 40,60 H 70" 
          stroke={greenColor} 
          strokeWidth="11" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none"
        />

        {/* Signal center blue dot */}
        <circle cx="82" cy="48" r="5.5" fill={blueColor} />

        {/* First concentric signal curve (blue) */}
        <path 
          d="M 83,34 A 20,20 0 0,1 97,46" 
          stroke={blueColor} 
          strokeWidth="4" 
          strokeLinecap="round" 
          fill="none"
        />

        {/* Second concentric signal curve (green) */}
        <path 
          d="M 85,22 A 32,32 0 0,1 106,42" 
          stroke={greenColor} 
          strokeWidth="4.5" 
          strokeLinecap="round" 
          fill="none"
        />

        {/* Third concentric signal curve (green) */}
        <path 
          d="M 88,10 A 45,45 0 0,1 116,38" 
          stroke={greenColor} 
          strokeWidth="5" 
          strokeLinecap="round" 
          fill="none"
        />
      </svg>

      {/* Styled text block */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span 
            className="logo-text-hormuud"
            style={{ 
              fontFamily: "'Outfit', sans-serif", 
              fontWeight: 800, 
              fontSize: size > 40 ? '1.8rem' : '1.25rem', 
              color: greenColor,
              letterSpacing: '0.04em'
            }}
          >
            HORMUUD
          </span>
          <span 
            className="logo-text-telecom"
            style={{ 
              fontFamily: "'Outfit', sans-serif", 
              fontWeight: 700, 
              fontSize: size > 40 ? '1.05rem' : '0.75rem', 
              color: blueColor,
              letterSpacing: '0.34em',
              marginTop: '-2px'
            }}
          >
            TELECOM
          </span>
        </div>
      )}
    </div>
  );
}
