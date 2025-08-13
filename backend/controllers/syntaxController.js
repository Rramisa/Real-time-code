const validateSyntax = async (req, res) => {
  try {
    const { content, language, fileId } = req.body;

    if (!content || !language) {
      return res.status(400).json({
        success: false,
        message: 'Content and language are required'
      });
    }

    // Basic validation for different languages
    const errors = [];
    const warnings = [];

    switch (language.toLowerCase()) {
      case 'javascript':
        validateJavaScript(content, errors, warnings);
        break;
      case 'python':
        validatePython(content, errors, warnings);
        break;
      case 'java':
        validateJava(content, errors, warnings);
        break;
      case 'cpp':
      case 'c++':
        validateCpp(content, errors, warnings);
        break;
      default:
        // For unsupported languages, do basic structural validation
        validateBasicStructure(content, errors, warnings);
    }

    res.json({
      success: true,
      errors,
      warnings,
      totalErrors: errors.length,
      totalWarnings: warnings.length
    });

  } catch (error) {
    console.error('Syntax validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during syntax validation'
    });
  }
};

// JavaScript validation
const validateJavaScript = (content, errors, warnings) => {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for missing semicolons (basic check)
    if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && 
        !line.trim().endsWith('}') && !line.trim().endsWith('(') && !line.trim().endsWith(')') &&
        !line.includes('function') && !line.includes('if') && !line.includes('for') && 
        !line.includes('while') && !line.includes('else') && !line.includes('//') &&
        !line.includes('/*') && !line.includes('*/') && !line.includes('const') &&
        !line.includes('let') && !line.includes('var') && !line.includes('return')) {
      warnings.push({
        line: lineNum,
        column: line.length + 1,
        message: 'Consider adding a semicolon at the end of this statement',
        code: 'missing-semicolon'
      });
    }

    // Check for console.log statements
    if (line.includes('console.log')) {
      warnings.push({
        line: lineNum,
        column: line.indexOf('console.log') + 1,
        message: 'Consider removing console.log in production code',
        code: 'console-log'
      });
    }

    // Check for unclosed strings
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    const backticks = (line.match(/`/g) || []).length;
    
    if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0 || backticks % 2 !== 0) {
      errors.push({
        line: lineNum,
        column: line.length + 1,
        message: 'Unclosed string literal',
        code: 'unclosed-string'
      });
    }
  });
};

// Python validation
const validatePython = (content, errors, warnings) => {
  const lines = content.split('\n');
  let indentLevel = 0;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    // Check indentation
    const currentIndent = line.length - line.trimStart().length;
    if (currentIndent % 4 !== 0 && currentIndent !== 0) {
      errors.push({
        line: lineNum,
        column: 1,
        message: 'Indentation should be a multiple of 4 spaces',
        code: 'indentation-error'
      });
    }

    // Check for print statements
    if (trimmedLine.startsWith('print(')) {
      warnings.push({
        line: lineNum,
        column: line.indexOf('print') + 1,
        message: 'Consider using logging instead of print in production',
        code: 'print-statement'
      });
    }

    // Check for missing colons after control structures
    if (trimmedLine.startsWith('if ') || trimmedLine.startsWith('elif ') || 
        trimmedLine.startsWith('else') || trimmedLine.startsWith('for ') || 
        trimmedLine.startsWith('while ') || trimmedLine.startsWith('def ') ||
        trimmedLine.startsWith('class ')) {
      if (!trimmedLine.endsWith(':')) {
        errors.push({
          line: lineNum,
          column: trimmedLine.length + 1,
          message: 'Missing colon after control structure',
          code: 'missing-colon'
        });
      }
    }
  });
};

// Java validation
const validateJava = (content, errors, warnings) => {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Check for System.out.println
    if (trimmedLine.includes('System.out.println')) {
      warnings.push({
        line: lineNum,
        column: line.indexOf('System.out.println') + 1,
        message: 'Consider using a proper logging framework',
        code: 'system-out'
      });
    }

    // Check for missing semicolons
    if (trimmedLine && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && 
        !trimmedLine.endsWith('}') && !trimmedLine.startsWith('//') && 
        !trimmedLine.startsWith('/*') && !trimmedLine.startsWith('*') &&
        !trimmedLine.includes('public') && !trimmedLine.includes('private') &&
        !trimmedLine.includes('protected') && !trimmedLine.includes('class') &&
        !trimmedLine.includes('if') && !trimmedLine.includes('for') && 
        !trimmedLine.includes('while') && !trimmedLine.includes('else')) {
      warnings.push({
        line: lineNum,
        column: line.length + 1,
        message: 'Consider adding a semicolon at the end of this statement',
        code: 'missing-semicolon'
      });
    }
  });
};

// C++ validation
const validateCpp = (content, errors, warnings) => {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Check for cout statements without semicolon
    if (trimmedLine.includes('cout') && !trimmedLine.endsWith(';')) {
      errors.push({
        line: lineNum,
        column: line.length + 1,
        message: 'Missing semicolon after cout statement',
        code: 'missing-semicolon'
      });
    }

    // Check for incomplete include statements
    if (trimmedLine.startsWith('#include') && !trimmedLine.includes('>') && !trimmedLine.includes('"')) {
      errors.push({
        line: lineNum,
        column: trimmedLine.length + 1,
        message: 'Incomplete include statement',
        code: 'incomplete-include'
      });
    }
  });
};

// Basic structural validation for unsupported languages
const validateBasicStructure = (content, errors, warnings) => {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for unclosed quotes
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    
    if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
      errors.push({
        line: lineNum,
        column: line.length + 1,
        message: 'Unclosed string literal',
        code: 'unclosed-string'
      });
    }
  });
};

module.exports = {
  validateSyntax
};

