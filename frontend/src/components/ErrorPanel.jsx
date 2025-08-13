import React from 'react';
import { getErrorHints } from '../utils/syntaxValidator';

const ErrorPanel = ({ 
  isVisible, 
  onClose, 
  errors = [], 
  warnings = [], 
  onErrorClick 
}) => {
  if (!isVisible) return null;

  const allIssues = [
    ...errors.map(error => ({ ...error, type: 'error' })),
    ...warnings.map(warning => ({ ...warning, type: 'warning' }))
  ].sort((a, b) => a.line - b.line);

  const getSeverityColor = (type) => {
    return type === 'error' ? '#f85149' : '#ff9500';
  };

  const getSeverityIcon = (type) => {
    return type === 'error' ? '●' : '●';
  };

  const handleErrorClick = (issue) => {
    if (onErrorClick) {
      onErrorClick(issue);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      backgroundColor: '#252526',
      borderLeft: '1px solid #3e3e42',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #3e3e42',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2d2d30'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#cccccc' }}>
            Problems
          </span>
          {allIssues.length > 0 && (
            <span style={{
              backgroundColor: '#404040',
              color: '#cccccc',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '12px'
            }}>
              {allIssues.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '4px',
            borderRadius: '2px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          ×
        </button>
      </div>

      {/* Issues List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {allIssues.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#888',
            fontSize: '14px'
          }}>
            No problems detected
          </div>
        ) : (
          <div>
            {allIssues.map((issue, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 16px',
                  borderBottom: '1px solid #2a2d2e',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
                onClick={() => handleErrorClick(issue)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2a2d2e'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{
                    color: getSeverityColor(issue.type),
                    fontSize: '12px',
                    marginTop: '2px'
                  }}>
                    {getSeverityIcon(issue.type)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: '#cccccc',
                      marginBottom: '4px',
                      lineHeight: '1.3'
                    }}>
                      {issue.message}
                    </div>
                    <div style={{
                      color: '#888',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>Line {issue.line}</span>
                      {issue.column && <span>Column {issue.column}</span>}
                      <span style={{
                        backgroundColor: '#404040',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        fontSize: '10px'
                      }}>
                        {issue.code || 'syntax'}
                      </span>
                    </div>
                    {/* Hint */}
                    <div style={{
                      marginTop: '6px',
                      padding: '6px 8px',
                      backgroundColor: '#1e1e1e',
                      borderRadius: '4px',
                      borderLeft: '3px solid #007acc',
                      fontSize: '11px',
                      color: '#cccccc'
                    }}>
                      <div style={{ color: '#007acc', fontWeight: 'bold', marginBottom: '2px' }}>
                        💡 Hint:
                      </div>
                      {getErrorHints(issue.code)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid #3e3e42',
        backgroundColor: '#2d2d30',
        fontSize: '12px',
        color: '#888',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>
          {errors.length} error{errors.length !== 1 ? 's' : ''}, {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
        </span>
        <span>
          Click to navigate
        </span>
      </div>
    </div>
  );
};

export default ErrorPanel;

