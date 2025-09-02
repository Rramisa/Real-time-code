import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { setValidationMarkers, getErrorHints } from '../utils/syntaxValidator';
import ErrorTooltip from './ErrorTooltip';
import { toast } from 'react-hot-toast';

const SyntaxAwareEditor = React.forwardRef(({ 
  value, 
  onChange, 
  language, 
  theme = 'vs-dark',
  options = {},
  onValidationChange 
}, ref) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [errorCount, setErrorCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [currentError, setCurrentError] = useState(null);
  const [editorError, setEditorError] = useState(null);

  // Initialize Monaco and validation provider
  const handleEditorDidMount = (editor, monaco) => {
    try {
      editorRef.current = editor;
      monacoRef.current = monaco;
      
      // Forward the ref
      if (ref) {
        ref.current = editor;
      }

      // Define two additional custom themes (Dracula and Retro)
      try {
        monaco.editor.defineTheme('dracula', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: '', foreground: 'f8f8f2', background: '282a36' },
            { token: 'comment', foreground: '6272a4' },
            { token: 'keyword', foreground: 'ff79c6' },
            { token: 'number', foreground: 'bd93f9' },
            { token: 'string', foreground: 'f1fa8c' },
            { token: 'type', foreground: '8be9fd' },
            { token: 'delimiter', foreground: 'f8f8f2' }
          ],
          colors: {
            'editor.background': '#282a36',
            'editor.foreground': '#f8f8f2',
            'editorLineNumber.foreground': '#6272a4',
            'editorLineNumber.activeForeground': '#f8f8f2',
            'editorCursor.foreground': '#ffb86c',
            'editor.selectionBackground': '#44475a',
            'editor.inactiveSelectionBackground': '#44475a88',
            'editor.lineHighlightBackground': '#3a3f5a',
            'editorIndentGuide.background': '#44475a'
          }
        });

        monaco.editor.defineTheme('retro', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: '', foreground: '33ff66', background: '000000' },
            { token: 'comment', foreground: '1aff1a' },
            { token: 'keyword', foreground: '00ffff' },
            { token: 'number', foreground: '00ffff' },
            { token: 'string', foreground: 'ffff00' },
            { token: 'type', foreground: '33ff66' }
          ],
          colors: {
            'editor.background': '#000000',
            'editor.foreground': '#33ff66',
            'editorLineNumber.foreground': '#1aff1a',
            'editorLineNumber.activeForeground': '#33ff66',
            'editorCursor.foreground': '#33ff66',
            'editor.selectionBackground': '#003300',
            'editor.inactiveSelectionBackground': '#00330099',
            'editor.lineHighlightBackground': '#001a00',
            'editorIndentGuide.background': '#003300'
          }
        });
      } catch (e) {
        // Theme definition best-effort; continue even if it fails
        console.warn('Theme definition failed:', e);
      }

      // Set up validation and error counting
      const updateValidation = () => {
        try {
          // Set validation markers
          setValidationMarkers(editor, monaco, language);
          
          // Update error counts with a small delay to ensure markers are set
          setTimeout(() => {
            try {
              const model = editor.getModel();
              if (model) {
                const markers = monaco.editor.getModelMarkers({ resource: model.uri });
                const errors = markers.filter(m => m.severity === monaco.MarkerSeverity.Error).length;
                const warnings = markers.filter(m => m.severity === monaco.MarkerSeverity.Warning).length;
                
                setErrorCount(errors);
                setWarningCount(warnings);
                
                if (onValidationChange) {
                  onValidationChange({ errors, warnings, markers });
                }
              }
            } catch (error) {
              console.error('Error updating validation:', error);
            }
          }, 50); // Small delay to ensure markers are processed
        } catch (error) {
          console.error('Error in updateValidation:', error);
        }
      };

      // Listen for model changes to update validation
      editor.onDidChangeModelContent(() => {
        setTimeout(updateValidation, 100); // Small delay to ensure content is updated
      });

      // Listen for marker changes to update error counts
      monaco.editor.onDidChangeMarkers((changedResources) => {
        try {
          const model = editor.getModel();
          if (!model) return;
          const modelUri = model.uri;
          if (!modelUri) return;

          const affected = Array.isArray(changedResources)
            ? changedResources.some((uri) => {
                try { return uri && uri.toString && uri.toString() === modelUri.toString(); } catch { return false; }
              })
            : false;
          if (!affected) return;

          const markers = monaco.editor.getModelMarkers({ resource: modelUri });
          const errors = markers.filter(m => m.severity === monaco.MarkerSeverity.Error).length;
          const warnings = markers.filter(m => m.severity === monaco.MarkerSeverity.Warning).length;

          setErrorCount(errors);
          setWarningCount(warnings);

          if (onValidationChange) {
            onValidationChange({ errors, warnings, markers });
          }
        } catch (error) {
          console.error('Error in marker change handler:', error);
        }
      });

      // Initial validation
      setTimeout(updateValidation, 100);
    } catch (error) {
      console.error('Error in handleEditorDidMount:', error);
      setEditorError(error);
    }
  };

  // Handle editor errors
  const handleEditorError = (error) => {
    console.error('Monaco Editor error:', error);
    setEditorError(error);
  };

  // Update validation when language changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current && language) {
      try {
        setValidationMarkers(editorRef.current, monacoRef.current, language);
      } catch (error) {
        console.error('Error updating validation for language change:', error);
      }
    }
  }, [language]);

  // Custom editor options with enhanced error display
  const enhancedOptions = {
    fontSize: 14,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'on',
    renderWhitespace: 'selection',
    // Enhanced error display options
    renderValidationDecorations: 'on',
    showUnused: true,
    showDeprecated: true,
    // Custom styling for errors
    overviewRulerLanes: 3,
    overviewRulerBorder: false,
    ...options
  };

  // Handle content changes
  const handleChange = (value, event) => {
    try {
      if (onChange) {
        onChange(value, event);
      }
    } catch (error) {
      console.error('Error in handleChange:', error);
    }
  };

  // Show error hints when user hovers over error markers
  const handleEditorMouseMove = (event) => {
    try {
      if (!editorRef.current || !monacoRef.current) return;

      const position = editorRef.current.getPosition();
      const model = editorRef.current.getModel();
      
      if (model) {
        const markers = monacoRef.current.editor.getModelMarkers({ resource: model.uri });
        const markerAtPosition = markers.find(marker => 
          position.lineNumber >= marker.startLineNumber && 
          position.lineNumber <= marker.endLineNumber &&
          position.column >= marker.startColumn && 
          position.column <= marker.endColumn
        );

        if (markerAtPosition) {
          // Show tooltip with error information
          setCurrentError(markerAtPosition);
          setTooltipPosition({ x: event.clientX, y: event.clientY });
          setTooltipVisible(true);
        } else {
          setTooltipVisible(false);
          setCurrentError(null);
        }
      }
    } catch (error) {
      console.error('Error in handleEditorMouseMove:', error);
    }
  };

  // Show error state if editor failed to load
  if (editorError) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#1e1e1e',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ color: '#f85149', margin: '0 0 16px 0' }}>Editor Error</h3>
        <p style={{ color: '#888', margin: '0 0 16px 0', textAlign: 'center' }}>
          Failed to load the code editor. Please refresh the page to try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Error/Warning Status Bar */}
      {(errorCount > 0 || warningCount > 0) && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {errorCount > 0 && (
            <span style={{ color: '#f85149', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px' }}>●</span>
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
          )}
          {warningCount > 0 && (
            <span style={{ color: '#ff9500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '14px' }}>●</span>
              {warningCount} warning{warningCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Monaco Editor */}
      <Editor
        height="100%"
        language={language}
        value={value}
        theme={theme}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        onError={handleEditorError}
        options={enhancedOptions}
        onMouseMove={handleEditorMouseMove}
      />

      {/* Error Tooltip */}
      <ErrorTooltip
        isVisible={tooltipVisible}
        position={tooltipPosition}
        error={currentError}
        onClose={() => {
          setTooltipVisible(false);
          setCurrentError(null);
        }}
      />
    </div>
  );
});

export default SyntaxAwareEditor;
