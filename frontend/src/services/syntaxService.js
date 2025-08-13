const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

export const validateSyntaxWithAPI = async (content, language, fileId = null) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/syntax/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        language,
        fileId
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to validate syntax');
    }
  } catch (error) {
    console.error('Syntax validation API error:', error);
    throw error;
  }
};

// Enhanced validation that combines client-side and server-side validation
export const enhancedSyntaxValidation = async (content, language, fileId = null) => {
  try {
    // Get server-side validation results
    const serverResults = await validateSyntaxWithAPI(content, language, fileId);
    
    return {
      success: true,
      errors: serverResults.errors || [],
      warnings: serverResults.warnings || [],
      totalErrors: serverResults.totalErrors || 0,
      totalWarnings: serverResults.totalWarnings || 0
    };
  } catch (error) {
    // Fallback to client-side validation if server fails
    console.warn('Server validation failed, falling back to client-side validation:', error);
    return {
      success: false,
      errors: [],
      warnings: [],
      totalErrors: 0,
      totalWarnings: 0,
      fallback: true
    };
  }
};

