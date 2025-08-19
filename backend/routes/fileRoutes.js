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


router.use(authenticateToken);

router.post('/files', createFile);              
router.post('/folders', createFolder);          
router.get('/tree', getTree);                   
router.get('/files/:id', getFile);             
router.put('/files/:id', updateFile);           
router.patch('/files/:id/rename', renameFile);  
router.delete('/files/:id', deleteFile);        
router.patch('/folders/:id/rename', renameFolder); 
router.delete('/folders/:id', deleteFolder);   

router.get('/download/zip', downloadZip); 


router.get('/files/:id/download', downloadFile);

module.exports = router;