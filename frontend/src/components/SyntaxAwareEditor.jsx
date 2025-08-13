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

  // Initialize Monaco and validation provider
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Forward the ref
    if (ref) {
      ref.current = editor;
    }

    // Set up validation and error counting
    const updateValidation = () => {
      // Set validation markers
      setValidationMarkers(editor, monaco, language);
      
      // Update error counts with a small delay to ensure markers are set
      setTimeout(() => {
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
      }, 50); // Small delay to ensure markers are processed
    };

    // Listen for model changes to update validation
    editor.onDidChangeModelContent(() => {
      setTimeout(updateValidation, 100); // Small delay to ensure content is updated
    });

    // Listen for marker changes to update error counts
    monaco.editor.onDidChangeMarkers((e) => {
      if (e.resource.toString() === editor.getModel().uri.toString()) {
        const markers = monaco.editor.getModelMarkers({ resource: editor.getModel().uri });
        const errors = markers.filter(m => m.severity === monaco.MarkerSeverity.Error).length;
        const warnings = markers.filter(m => m.severity === monaco.MarkerSeverity.Warning).length;
        
        setErrorCount(errors);
        setWarningCount(warnings);
        
        if (onValidationChange) {
          onValidationChange({ errors, warnings, markers });
        }
      }
    });

    // Initial validation
    setTimeout(updateValidation, 100);
  };

  // Update validation when language changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current && language) {
      setValidationMarkers(editorRef.current, monacoRef.current, language);
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
    if (onChange) {
      onChange(value, event);
    }
  };

  // Show error hints when user hovers over error markers
  const handleEditorMouseMove = (event) => {
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
  };

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
