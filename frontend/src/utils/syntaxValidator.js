// Syntax validation utilities for Monaco Editor
// Note: We don't import monaco directly, we use the instance passed from the editor

// Common syntax error patterns for different languages
const syntaxPatterns = {
  javascript: [
    {
      pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{[^}]*$/m,
      message: 'Missing closing brace for function',
      severity: 'Error'
    },
    {
      pattern: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\{[^}]*$/m,
      message: 'Missing closing brace',
      severity: 'Error'
    },
    {
      pattern: /\(\s*[^)]*$/m,
      message: 'Missing closing parenthesis',
      severity: 'Error'
    },
    {
      pattern: /\[\s*[^\]]*$/m,
      message: 'Missing closing bracket',
      severity: 'Error'
    },
    {
      pattern: /['"`][^'"`]*$/m,
      message: 'Unclosed string literal',
      severity: 'Error'
    },
    {
      pattern: /\/\*[^*]*\*?(?:\/[^*]|\*[^/])*$/m,
      message: 'Unclosed comment block',
      severity: 'Warning'
    },
    {
      pattern: /console\.log\s*\([^)]*\)/g,
      message: 'Consider removing console.log in production',
      severity: 'Info'
    }
  ],
  python: [
    {
      pattern: /^if\s+[^:]*$/m,
      message: 'Missing colon after if statement',
      severity: 'Error',
      code: 'missing-colon'
    },
    {
      pattern: /^for\s+[^:]*$/m,
      message: 'Missing colon after for statement',
      severity: 'Error',
      code: 'missing-colon'
    },
    {
      pattern: /^while\s+[^:]*$/m,
      message: 'Missing colon after while statement',
      severity: 'Error',
      code: 'missing-colon'
    },
    {
      pattern: /^def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*$/m,
      message: 'Missing colon after function definition',
      severity: 'Error',
      code: 'missing-colon'
    },
    {
      pattern: /^elif\s+[^:]*$/m,
      message: 'Missing colon after elif statement',
      severity: 'Error',
      code: 'missing-colon'
    },
    {
      pattern: /^else\s*$/m,
      message: 'Missing colon after else statement',
      severity: 'Error',
      code: 'missing-colon'
    },
    {
      pattern: /^try\s*$/m,
      message: 'Missing colon after try statement',
      severity: 'Error',
      code: 'missing-colon'
    },
    {
      pattern: /^except\s*$/m,
      message: 'Missing colon after except statement',
      severity: 'Error',
      code: 'missing-colon'
    },
    {
      pattern: /^finally\s*$/m,
      message: 'Missing colon after finally statement',
      severity: 'Error',
      code: 'missing-colon'
    },
    {
      pattern: /^with\s+[^:]*$/m,
      message: 'Missing colon after with statement',
      severity: 'Error',
      code: 'missing-colon'
    },
    {
      pattern: /^class\s+[a-zA-Z_][a-zA-Z0-9_]*\s*$/m,
      message: 'Missing colon after class definition',
      severity: 'Error',
      code: 'missing-colon'
    },
    {
      pattern: /print\s*\([^)]*\)/g,
      message: 'Consider using logging instead of print in production',
      severity: 'Info'
    },
    {
      pattern: /^import\s+[^;]*$/m,
      message: 'Invalid import statement',
      severity: 'Error'
    },
    {
      pattern: /^from\s+[^;]*$/m,
      message: 'Invalid from import statement',
      severity: 'Error'
    }
  ],
  java: [
    {
      pattern: /public\s+class\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\{[^}]*$/m,
      message: 'Missing closing brace for class',
      severity: 'Error'
    },
    {
      pattern: /public\s+[a-zA-Z_][a-zA-Z0-9_]*\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{[^}]*$/m,
      message: 'Missing closing brace for method',
      severity: 'Error'
    },
    {
      pattern: /\(\s*[^)]*$/m,
      message: 'Missing closing parenthesis',
      severity: 'Error'
    },
    {
      pattern: /\[\s*[^\]]*$/m,
      message: 'Missing closing bracket',
      severity: 'Error'
    },
    {
      pattern: /['"][^'"]*$/m,
      message: 'Unclosed string literal',
      severity: 'Error'
    },
    {
      pattern: /System\.out\.println\s*\([^)]*\)/g,
      message: 'Consider using proper logging framework',
      severity: 'Info'
    }
  ],
  cpp: [
    {
      pattern: /#include\s*<[^>]*$/m,
      message: 'Incomplete include statement',
      severity: 'Error'
    },
    {
      pattern: /class\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\{[^}]*$/m,
      message: 'Missing closing brace for class',
      severity: 'Error'
    },
    {
      pattern: /[a-zA-Z_][a-zA-Z0-9_]*\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{[^}]*$/m,
      message: 'Missing closing brace for function',
      severity: 'Error'
    },
    {
      pattern: /\(\s*[^)]*$/m,
      message: 'Missing closing parenthesis',
      severity: 'Error'
    },
    {
      pattern: /\[\s*[^\]]*$/m,
      message: 'Missing closing bracket',
      severity: 'Error'
    },
    {
      pattern: /['"][^'"]*$/m,
      message: 'Unclosed string literal',
      severity: 'Error'
    },
    {
      pattern: /cout\s*<<[^;]*$/m,
      message: 'Missing semicolon after cout statement',
      severity: 'Error'
    }
  ]
};

// Get language-specific patterns
const getLanguagePatterns = (language) => {
  const lang = language.toLowerCase();
  return syntaxPatterns[lang] || syntaxPatterns.javascript;
};

// Validate syntax and return markers
export const validateSyntax = (content, language) => {
  try {
    const patterns = getLanguagePatterns(language);
    const markers = [];
    const lines = content.split('\n');

    // For Python, use a more sophisticated validation
    if (language.toLowerCase() === 'python') {
      return validatePythonSyntax(content);
    }
    
    // For JavaScript, use a more sophisticated validation
    if (language.toLowerCase() === 'javascript') {
      return validateJavaScriptSyntax(content);
    }

    lines.forEach((line, lineIndex) => {
      patterns.forEach(pattern => {
        try {
          const matches = line.match(pattern.pattern);
          if (matches) {
            markers.push({
              startLineNumber: lineIndex + 1,
              startColumn: 1,
              endLineNumber: lineIndex + 1,
              endColumn: line.length + 1,
              message: pattern.message,
              severity: pattern.severity,
              code: 'syntax-error'
            });
          }
        } catch (error) {
          console.error('Error in pattern matching:', error);
        }
      });
    });

    // Check for common structural issues
    const structuralErrors = checkStructuralIssues(content, language);
    markers.push(...structuralErrors);

    return markers;
  } catch (error) {
    console.error('Error in validateSyntax:', error);
    return []; // Return empty array instead of throwing
  }
};

// Python-specific syntax validation
const validatePythonSyntax = (content) => {
  const markers = [];
  const lines = content.split('\n');
  const patterns = getLanguagePatterns('python');
  
  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }
    
    // Check for missing colons and other syntax errors
    patterns.forEach(pattern => {
      try {
        const matches = line.match(pattern.pattern);
        if (matches) {
          markers.push({
            startLineNumber: lineIndex + 1,
            startColumn: 1,
            endLineNumber: lineIndex + 1,
            endColumn: line.length + 1,
            message: pattern.message,
            severity: pattern.severity,
            code: 'syntax-error'
          });
        }
      } catch (error) {
        console.error('Error in Python pattern matching:', error);
      }
    });
    
    // Check for unclosed strings (more sophisticated)
    if (trimmedLine.includes('"') || trimmedLine.includes("'")) {
      const quoteCount = (trimmedLine.match(/['"]/g) || []).length;
      if (quoteCount % 2 !== 0) {
        markers.push({
          startLineNumber: lineIndex + 1,
          startColumn: 1,
          endLineNumber: lineIndex + 1,
          endColumn: line.length + 1,
          message: 'Unclosed string literal',
          severity: 'Error',
          code: 'unclosed-string'
        });
      }
    }
  });
  
  // Add structural validation for Python
  const structuralErrors = checkStructuralIssues(content, 'python');
  markers.push(...structuralErrors);
  
  return markers;
};

// JavaScript-specific syntax validation
const validateJavaScriptSyntax = (content) => {
  const markers = [];
  const lines = content.split('\n');
  
  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
      return;
    }
    
    // Check for incomplete function declarations
    if (trimmedLine.match(/^(function|const|let|var)\s+\w+\s*\([^)]*\)\s*\{[^}]*$/)) {
      // This is a valid function declaration, no error
    }
    // Check for incomplete if/for/while statements
    else if (trimmedLine.match(/^(if|for|while)\s*\([^)]*\)\s*\{[^}]*$/)) {
      // This is a valid control structure, no error
    }
    // Check for truly unclosed strings (more sophisticated)
    else if (trimmedLine.includes('"') || trimmedLine.includes("'") || trimmedLine.includes('`')) {
      // Only check for unclosed strings if the line actually contains quotes
      const quoteCount = (trimmedLine.match(/['"`]/g) || []).length;
      if (quoteCount % 2 !== 0) {
        markers.push({
          startLineNumber: lineIndex + 1,
          startColumn: 1,
          endLineNumber: lineIndex + 1,
          endColumn: line.length + 1,
          message: 'Unclosed string literal',
          severity: 'Error',
          code: 'unclosed-string'
        });
      }
    }
  });
  
  // Add structural validation for JavaScript
  const structuralErrors = checkStructuralIssues(content, 'javascript');
  markers.push(...structuralErrors);
  
  return markers;
};

// Check for structural issues like unmatched braces, brackets, etc.
const checkStructuralIssues = (content, language) => {
  const markers = [];
  const lines = content.split('\n');
  
  // Stack-based brace matching
  const braceStack = [];
  const bracketStack = [];
  const parenStack = [];
  
  lines.forEach((line, lineIndex) => {
    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      
      switch (char) {
        case '{':
          braceStack.push({ line: lineIndex + 1, column: charIndex + 1 });
          break;
        case '}':
          if (braceStack.length === 0) {
            markers.push({
              startLineNumber: lineIndex + 1,
              startColumn: charIndex + 1,
              endLineNumber: lineIndex + 1,
              endColumn: charIndex + 2,
              message: 'Unexpected closing brace',
              severity: 'Error',
              code: 'unexpected-brace'
            });
          } else {
            braceStack.pop();
          }
          break;
        case '[':
          bracketStack.push({ line: lineIndex + 1, column: charIndex + 1 });
          break;
        case ']':
          if (bracketStack.length === 0) {
            markers.push({
              startLineNumber: lineIndex + 1,
              startColumn: charIndex + 1,
              endLineNumber: lineIndex + 1,
              endColumn: charIndex + 2,
              message: 'Unexpected closing bracket',
              severity: 'Error',
              code: 'unexpected-bracket'
            });
          } else {
            bracketStack.pop();
          }
          break;
        case '(':
          parenStack.push({ line: lineIndex + 1, column: charIndex + 1 });
          break;
        case ')':
          if (parenStack.length === 0) {
            markers.push({
              startLineNumber: lineIndex + 1,
              startColumn: charIndex + 1,
              endLineNumber: lineIndex + 1,
              endColumn: charIndex + 2,
              message: 'Unexpected closing parenthesis',
              severity: 'Error',
              code: 'unexpected-paren'
            });
          } else {
            parenStack.pop();
          }
          break;
      }
    }
  });

  // Check for unclosed braces/brackets/parentheses
  braceStack.forEach(item => {
    markers.push({
      startLineNumber: item.line,
      startColumn: item.column,
      endLineNumber: item.line,
      endColumn: item.column + 1,
      message: 'Missing closing brace',
      severity: 'Error',
      code: 'missing-brace'
    });
  });

  bracketStack.forEach(item => {
    markers.push({
      startLineNumber: item.line,
      startColumn: item.column,
      endLineNumber: item.line,
      endColumn: item.column + 1,
      message: 'Missing closing bracket',
      severity: 'Error',
      code: 'missing-bracket'
    });
  });

  parenStack.forEach(item => {
    markers.push({
      startLineNumber: item.line,
      startColumn: item.column,
      endLineNumber: item.line,
      endColumn: item.column + 1,
      message: 'Missing closing parenthesis',
      severity: 'Error',
      code: 'missing-paren'
    });
  });

  return markers;
};

// Get helpful hints for common errors
export const getErrorHints = (errorCode) => {
  const hints = {
    'syntax-error': 'Check the syntax of this line. Common issues include missing semicolons, brackets, or quotes.',
    'missing-colon': 'Add a colon (:) at the end of this statement. In Python, control structures like if, for, while, def, class, etc. must end with a colon.',
    'unexpected-brace': 'You have an extra closing brace. Check if you have an opening brace that matches this one.',
    'unexpected-bracket': 'You have an extra closing bracket. Check if you have an opening bracket that matches this one.',
    'unexpected-paren': 'You have an extra closing parenthesis. Check if you have an opening parenthesis that matches this one.',
    'missing-brace': 'You need to add a closing brace to match the opening brace.',
    'missing-bracket': 'You need to add a closing bracket to match the opening bracket.',
    'missing-paren': 'You need to add a closing parenthesis to match the opening parenthesis.',
    'unclosed-string': 'You have an unclosed string literal. Make sure to close your quotes properly.',
    'unclosed-comment': 'You have an unclosed comment block. Make sure to close your /* comment */ properly.'
  };
  
  return hints[errorCode] || 'Check the syntax and structure of your code.';
};

// Monaco editor validation provider (for future use with language servers)
export const createValidationProvider = (language) => {
  return {
    provideValidation: (model) => {
      const content = model.getValue();
      const markers = validateSyntax(content, language);
      
      return {
        markers: markers
      };
    }
  };
};

// Function to manually validate and set markers
export const setValidationMarkers = (editor, monaco, language) => {
  try {
    if (!editor || !monaco) return;
    
    const model = editor.getModel();
    if (!model) return;
    
    const content = model.getValue();
    const markers = validateSyntax(content, language);
    
    // Convert string severity to Monaco severity values
    const convertedMarkers = markers.map(marker => ({
      ...marker,
      severity: marker.severity === 'Error' ? monaco.MarkerSeverity.Error :
                marker.severity === 'Warning' ? monaco.MarkerSeverity.Warning :
                marker.severity === 'Info' ? monaco.MarkerSeverity.Info :
                monaco.MarkerSeverity.Error
    }));
    
    // Set the markers on the model
    monaco.editor.setModelMarkers(model, 'syntax-validator', convertedMarkers);
  } catch (error) {
    console.error('Error in setValidationMarkers:', error);
    // Don't throw the error to prevent script errors
  }
};
