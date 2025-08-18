import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import MessagePanel from './MessagePanel';
import SyntaxAwareEditor from './SyntaxAwareEditor';
import ErrorPanel from './ErrorPanel';

const VSCodeLayout = () => {
  const [treeData, setTreeData] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [showErrorPanel, setShowErrorPanel] = useState(false);
  const [validationState, setValidationState] = useState({ errors: 0, warnings: 0, markers: [] });
  const autoSaveTimeoutRef = useRef(null);
  const editorRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

  // Fetch the folder/file tree
  const fetchTree = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/tree`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTreeData(data.tree || []);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to fetch files');
      }
    } catch (error) {
      console.error('Error fetching tree:', error);
      toast.error('Network error while fetching files');
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  // Fetch a specific file with content
  const fetchFile = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.file;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch file');
      }
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  };

  // Auto-save functionality
  const autoSave = useCallback(async (fileId, content) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        // Update file in current file state
        setCurrentFile(prevFile => 
          prevFile?.id === fileId 
            ? { ...prevFile, content, updatedAt: new Date().toISOString() }
            : prevFile
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save file');
      }
    } catch (error) {
      console.error('Error auto-saving file:', error);
      // Don't show toast for auto-save failures to keep it silent
    }
  }, [API_BASE_URL]);

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges && currentFile?.id) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save (5 seconds)
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave(currentFile.id, currentFile.content);
      }, 5000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, currentFile, autoSave]);

  // Create new file
  const createFile = async (parentFolderId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: fileName, parentFolderId, content: '' })
      });

      if (response.ok) {
        await fetchTree();
        const data = await response.json();
        toast.success('File created successfully');
        return data.file;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create file');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create file');
      throw error;
    }
  };

  // Create new folder
  const createFolder = async (parentFolderId, folderName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/folders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: folderName, parentFolderId })
      });

      if (response.ok) {
        await fetchTree();
        toast.success('Folder created successfully');
        // Expand parent folder
        if (parentFolderId) {
          setExpandedFolders(prev => new Set([...prev, parentFolderId]));
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create folder');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create folder');
      throw error;
    }
  };

  // Delete file
  const deleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchTree();
        if (currentFile?.id === fileId) {
          setCurrentFile(null);
        }
        toast.success('File deleted successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete file');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete file');
      throw error;
    }
  };

  // Delete folder
  const deleteFolder = async (folderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchTree();
        toast.success('Folder deleted successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete folder');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete folder');
      throw error;
    }
  };

  // Rename file
  const renameFile = async (fileId, newName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/rename`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });

      if (response.ok) {
        await fetchTree();
        // Update current file if it's the one being renamed
        if (currentFile?.id === fileId) {
          setCurrentFile(prev => prev ? { ...prev, name: newName } : null);
        }
        toast.success('File renamed successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to rename file');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to rename file');
      throw error;
    }
  };

  // Rename folder
  const renameFolder = async (folderId, newName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/folders/${folderId}/rename`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });

      if (response.ok) {
        await fetchTree();
        toast.success('Folder renamed successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to rename folder');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to rename folder');
      throw error;
    }
  };

  // Handle file selection
  const handleFileSelect = async (file) => {
    try {
      const fileWithContent = await fetchFile(file.id);
      setCurrentFile(fileWithContent);
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error(error.message || 'Failed to load file');
    }
  };

  // Handle content change
  const handleContentChange = (content) => {
    setCurrentFile(prevFile => 
      prevFile ? { ...prevFile, content } : null
    );
    setHasUnsavedChanges(true);
  };

  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Get language from file extension
  const getLanguageFromExtension = (filename) => {
    if (!filename) return 'javascript';
    
    const extension = filename.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'sql': 'sql',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin'
    };
    
    return languageMap[extension] || 'plaintext';
  };

  // Initial load
  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // Debug currentFile changes
  useEffect(() => {
    console.log('VSCodeLayout - currentFile changed:', currentFile);
    if (currentFile) {
      console.log('Current file details:', {
        id: currentFile.id,
        _id: currentFile._id,
        name: currentFile.name,
        type: currentFile.type
      });
    }
  }, [currentFile]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', color: 'white' }}>
      {/* Top Navigation Bar */}
      <div style={{
        height: '40px',
        backgroundColor: '#2d2d30',
        borderBottom: '1px solid #3e3e42',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', color: '#cccccc' }}>CodeSync - File Manager</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowErrorPanel(!showErrorPanel)}
            style={{
              backgroundColor: (validationState.errors > 0 || validationState.warnings > 0) ? '#f85149' : '#404040',
              border: 'none',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              if (validationState.errors > 0 || validationState.warnings > 0) {
                e.target.style.backgroundColor = '#d73a49';
              }
            }}
            onMouseLeave={(e) => {
              if (validationState.errors > 0 || validationState.warnings > 0) {
                e.target.style.backgroundColor = '#f85149';
              }
            }}
            title="View syntax errors and warnings"
          >
            ⚠️ Problems ({validationState.errors + validationState.warnings})
          </button>
          <button
            onClick={() => {
              console.log('Discussion button clicked, currentFile:', currentFile);
              if (!currentFile) {
                toast.error('Please select a file first to start a discussion');
                return;
              }
              setShowMessagePanel(!showMessagePanel);
            }}
            style={{
              backgroundColor: currentFile ? '#007acc' : '#404040',
              border: 'none',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: currentFile ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              console.log('Button hover - currentFile:', currentFile);
              if (currentFile) {
                e.target.style.backgroundColor = '#005a9e';
              }
            }}
            onMouseLeave={(e) => {
              if (currentFile) {
                e.target.style.backgroundColor = '#007acc';
              }
            }}
            title={currentFile ? 'Open file discussion' : 'Select a file first to discuss'}
          >
            💬 Discussion
          </button>
          <button
            onClick={() => navigate('/status')}
            style={{
              backgroundColor: '#404040',
              border: 'none',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#505050'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#404040'; }}
            title="View user status"
          >
            📊 Status
          </button>
          <span style={{ color: '#888', fontSize: '12px' }}>Welcome, {user?.username || user?.email}</span>
          <button
            onClick={() => {
              logout();
              navigate('/');
              toast.success('Logged out successfully');
            }}
            style={{
              backgroundColor: '#dc2626',
              border: 'none',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* File Explorer Sidebar */}
        <FileExplorer
        treeData={treeData}
        expandedFolders={expandedFolders}
        currentFile={currentFile}
        isLoading={isLoading}
        onFileSelect={handleFileSelect}
        onToggleFolder={toggleFolder}
        onCreateFile={createFile}
        onCreateFolder={createFolder}
        onDeleteFile={deleteFile}
        onDeleteFolder={deleteFolder}
        onRenameFile={renameFile}
        onRenameFolder={renameFolder}
        onRefresh={fetchTree}
      />

      {/* Editor Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentFile ? (
          <>
            {/* File Tab */}
            <div style={{
              height: '40px',
              backgroundColor: '#2d2d30',
              borderBottom: '1px solid #3e3e42',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: '16px',
              paddingRight: '16px'
            }}>
              <span style={{ fontSize: '14px', color: 'white' }}>
                {currentFile.name}
                {hasUnsavedChanges && <span style={{ color: '#ff9500', marginLeft: '4px' }}>●</span>}
              </span>
              
              {/* Validation Status */}
              {(validationState.errors > 0 || validationState.warnings > 0) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  {validationState.errors > 0 && (
                    <span style={{ color: '#f85149', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '10px' }}>●</span>
                      {validationState.errors}
                    </span>
                  )}
                  {validationState.warnings > 0 && (
                    <span style={{ color: '#ff9500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '10px' }}>●</span>
                      {validationState.warnings}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Syntax Aware Editor */}
            <div style={{ flex: 1 }}>
              <SyntaxAwareEditor
                value={currentFile.content}
                onChange={handleContentChange}
                language={getLanguageFromExtension(currentFile.name)}
                theme="vs-dark"
                onValidationChange={setValidationState}
                ref={editorRef}
              />
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📁</div>
            <h3 style={{ color: '#888', margin: 0 }}>No file selected</h3>
            <p style={{ color: '#666', margin: '8px 0 0 0' }}>Select a file from the explorer to start editing</p>
          </div>
        )}
      </div>
      </div>

      {/* Message Panel */}
      <MessagePanel
        fileId={currentFile?.id || currentFile?._id}
        isOpen={showMessagePanel}
        onClose={() => setShowMessagePanel(false)}
      />

      {/* Error Panel */}
      <ErrorPanel
        isVisible={showErrorPanel}
        onClose={() => setShowErrorPanel(false)}
        errors={validationState.markers.filter(m => m.severity === 1)} // Monaco uses 1 for errors
        warnings={validationState.markers.filter(m => m.severity === 2)} // Monaco uses 2 for warnings
        onErrorClick={(issue) => {
          // Navigate to the error in the editor
          if (editorRef.current) {
            editorRef.current.setPosition({
              lineNumber: issue.line,
              column: issue.column || 1
            });
            editorRef.current.focus();
          }
        }}
      />
    </div>
  );
};

// File Explorer Component
const FileExplorer = ({ 
  treeData, 
  expandedFolders, 
  currentFile, 
  isLoading,
  onFileSelect, 
  onToggleFolder, 
  onCreateFile, 
  onCreateFolder, 
  onDeleteFile, 
  onDeleteFolder,
  onRenameFile,
  onRenameFolder,
  onRefresh 
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('file'); // 'file' or 'folder'
  const [createParentId, setCreateParentId] = useState(null);
  const [createName, setCreateName] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameItem, setRenameItem] = useState(null);
  const [renameName, setRenameName] = useState('');

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item
    });
  };

  const handleCreateClick = (type, parentId = null) => {
    setCreateType(type);
    setCreateParentId(parentId);
    setCreateName('');
    setShowCreateModal(true);
    setContextMenu(null);
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;

    try {
      if (createType === 'file') {
        await onCreateFile(createParentId, createName.trim());
      } else {
        await onCreateFolder(createParentId, createName.trim());
      }
      setShowCreateModal(false);
    } catch (error) {
      // Error handled in parent
    }
  };

  const handleRenameClick = (item) => {
    setRenameItem(item);
    setRenameName(item.name);
    setShowRenameModal(true);
    setContextMenu(null);
  };

  const handleRename = async () => {
    if (!renameName.trim() || !renameItem) return;

    try {
      if (renameItem.type === 'file') {
        await onRenameFile(renameItem.id, renameName.trim());
      } else {
        await onRenameFolder(renameItem.id, renameName.trim());
      }
      setShowRenameModal(false);
      setRenameItem(null);
      setRenameName('');
    } catch (error) {
      // Error handled in parent
    }
  };

  const handleDelete = async (item) => {
    const confirmMessage = item.type === 'folder' 
      ? `Are you sure you want to delete "${item.name}" and all its contents?`
      : `Are you sure you want to delete "${item.name}"?`;
      
    if (window.confirm(confirmMessage)) {
      try {
        if (item.type === 'folder') {
          await onDeleteFolder(item.id);
        } else {
          await onDeleteFile(item.id);
        }
      } catch (error) {
        // Error handled in parent
      }
    }
    setContextMenu(null);
  };

  const renderTreeItem = (item, level = 0) => {
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = currentFile?.id === item.id;

    return (
      <div key={item.id}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            paddingLeft: `${level * 16 + 8}px`,
            cursor: 'pointer',
            backgroundColor: isSelected ? '#37373d' : 'transparent',
            fontSize: '14px'
          }}
          onClick={() => {
            if (item.type === 'folder') {
              onToggleFolder(item.id);
            } else {
              onFileSelect(item);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, item)}
          onMouseEnter={(e) => {
            if (!isSelected) e.target.style.backgroundColor = '#2a2d2e';
          }}
          onMouseLeave={(e) => {
            if (!isSelected) e.target.style.backgroundColor = 'transparent';
          }}
        >
          {item.type === 'folder' && (
            <span style={{ marginRight: '4px', fontSize: '12px' }}>
              {isExpanded ? '📂' : '📁'}
            </span>
          )}
          {item.type === 'file' && (
            <span style={{ marginRight: '4px', fontSize: '12px' }}>
              📄
            </span>
          )}
          <span>{item.name}</span>
        </div>
        
        {item.type === 'folder' && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: '300px',
      backgroundColor: '#252526',
      borderRight: '1px solid #3e3e42',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #3e3e42',
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#cccccc'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Explorer</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleCreateClick('file')}
              style={{
                background: 'none',
                border: 'none',
                color: '#cccccc',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '2px'
              }}
              title="New File"
            >
              📄
            </button>
            <button
              onClick={() => handleCreateClick('folder')}
              style={{
                background: 'none',
                border: 'none',
                color: '#cccccc',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '2px'
              }}
              title="New Folder"
            >
              📁
            </button>
            <button
              onClick={onRefresh}
              style={{
                background: 'none',
                border: 'none',
                color: '#cccccc',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '2px'
              }}
              title="Refresh"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* Tree */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#888' }}>
            Loading...
          </div>
        ) : treeData.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#888' }}>
            No files or folders yet.
            <br />
            Create your first file or folder.
          </div>
        ) : (
          treeData.map(item => renderTreeItem(item))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: '#3c3c3c',
            border: '1px solid #5e5e5e',
            borderRadius: '4px',
            zIndex: 1000,
            minWidth: '150px'
          }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {contextMenu.item.type === 'folder' && (
            <>
              <div
                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '14px' }}
                onClick={() => handleCreateClick('file', contextMenu.item.id)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#505050'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                New File
              </div>
              <div
                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '14px' }}
                onClick={() => handleCreateClick('folder', contextMenu.item.id)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#505050'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                New Folder
              </div>
              <div style={{ height: '1px', backgroundColor: '#5e5e5e', margin: '4px 0' }} />
            </>
          )}
          <div
            style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '14px' }}
            onClick={() => handleRenameClick(contextMenu.item)}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#505050'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Rename
          </div>
          <div
            style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '14px', color: '#f85149' }}
            onClick={() => handleDelete(contextMenu.item)}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#505050'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Delete
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#2d2d30',
            borderRadius: '8px',
            padding: '24px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
              Create New {createType === 'file' ? 'File' : 'Folder'}
            </h3>
            
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder={`Enter ${createType} name...`}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#1e1e1e',
                border: '1px solid #3e3e42',
                borderRadius: '4px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box',
                marginBottom: '16px'
              }}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
            />
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!createName.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: createName.trim() ? '#0e639c' : '#404040',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: createName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#2d2d30',
            borderRadius: '8px',
            padding: '24px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
              Rename {renameItem?.type === 'file' ? 'File' : 'Folder'}
            </h3>
            
            <input
              type="text"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              placeholder={`Enter new ${renameItem?.type} name...`}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#1e1e1e',
                border: '1px solid #3e3e42',
                borderRadius: '4px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box',
                marginBottom: '16px'
              }}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
              }}
            />
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameItem(null);
                  setRenameName('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                disabled={!renameName.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: renameName.trim() ? '#0e639c' : '#404040',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: renameName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VSCodeLayout;