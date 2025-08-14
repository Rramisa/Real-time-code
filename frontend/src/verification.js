// Verification script to test React and dependencies
export const verifyReactSetup = () => {
  try {
    // Test React imports
    const React = require('react');
    console.log('✅ React version:', React.version);
    console.log('✅ React exports available:', Object.keys(React).length, 'exports');
    
    // Test React Router
    const { BrowserRouter, Routes, Route } = require('react-router-dom');
    console.log('✅ React Router imports working');
    
    // Test Monaco Editor
    const { Editor } = require('@monaco-editor/react');
    console.log('✅ Monaco Editor imports working');
    
    // Test React Hot Toast
    const { toast } = require('react-hot-toast');
    console.log('✅ React Hot Toast imports working');
    
    console.log('🎉 All dependencies are working correctly!');
    return true;
  } catch (error) {
    console.error('❌ Error in verification:', error);
    return false;
  }
};

// Make available in development
if (process.env.NODE_ENV === 'development') {
  window.verifyReactSetup = verifyReactSetup;
}
