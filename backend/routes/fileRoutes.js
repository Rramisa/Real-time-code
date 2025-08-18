const express = require('express');
const { authenticateToken } = require('../helper/authMiddleware');
const { 
  createFile,
  createFolder, 
  getTree,
  getFile, 
  updateFile, 
  deleteFile,
  deleteFolder,
  renameFile,
  renameFolder,
  downloadZip,
  downloadFile
} = require('../controllers/fileController');

const router = express.Router();

// All file routes require authentication
router.use(authenticateToken);

// Folder and file operations
router.post('/files', createFile);              // Create new file
router.post('/folders', createFolder);          // Create new folder
router.get('/tree', getTree);                   // Get folder/file tree structure
router.get('/files/:id', getFile);              // Get specific file with content
router.put('/files/:id', updateFile);           // Update file (auto-save)
router.patch('/files/:id/rename', renameFile);  // Rename file
router.delete('/files/:id', deleteFile);        // Delete file
router.patch('/folders/:id/rename', renameFolder); // Rename folder
router.delete('/folders/:id', deleteFolder);    // Delete folder recursively

// Download files as ZIP
router.get('/download/zip', downloadZip); // Optional query: ?folderId=... or ?fileId=...

// Download a single file (raw)
router.get('/files/:id/download', downloadFile);

module.exports = router;