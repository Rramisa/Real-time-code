import React, { useState, useEffect } from 'react';
import { getErrorHints } from '../utils/syntaxValidator';

const ErrorTooltip = ({ 
  isVisible, 
  position, 
  error, 
  onClose 
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isVisible && position) {
      // Position tooltip near the error but ensure it stays within viewport
      const tooltipWidth = 300;
      const tooltipHeight = 120;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x + 20; // Offset from cursor
      let y = position.y - 10;

      // Adjust if tooltip would go off screen
      if (x + tooltipWidth > viewportWidth) {
        x = position.x - tooltipWidth - 20;
      }
      if (y + tooltipHeight > viewportHeight) {
        y = position.y - tooltipHeight + 10;
      }

      setTooltipPosition({ x, y });
    }
  }, [isVisible, position]);

  if (!isVisible || !error) {
    return null;
  }

  const hint = getErrorHints(error.code);

  return (
    <div
      style={{
        position: 'fixed',
        top: tooltipPosition.y,
        left: tooltipPosition.x,
        zIndex: 1000,
        backgroundColor: '#2d2d30',
        border: '1px solid #5e5e5e',
        borderRadius: '6px',
        padding: '12px',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        fontSize: '13px',
        lineHeight: '1.4'
      }}
      onMouseLeave={onClose}
    >
      {/* Error Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px',
        paddingBottom: '8px',
        borderBottom: '1px solid #5e5e5e'
      }}>
        <span style={{
          color: error.severity === 'Error' ? '#f85149' : '#ff9500',
          fontSize: '14px',
          marginRight: '6px'
        }}>
          ●
        </span>
        <span style={{
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {error.severity}
        </span>
      </div>

      {/* Error Message */}
      <div style={{
        color: '#cccccc',
        marginBottom: '8px',
        fontSize: '13px'
      }}>
        {error.message}
      </div>

      {/* Helpful Hint */}
      <div style={{
        backgroundColor: '#1e1e1e',
        padding: '8px',
        borderRadius: '4px',
        borderLeft: '3px solid #007acc'
      }}>
        <div style={{
          color: '#007acc',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '4px'
        }}>
          💡 Hint:
        </div>
        <div style={{
          color: '#cccccc',
          fontSize: '12px'
        }}>
          {hint}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'none',
          border: 'none',
          color: '#888',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '2px',
          borderRadius: '2px'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        ×
      </button>
    </div>
  );
};

export default ErrorTooltip;

