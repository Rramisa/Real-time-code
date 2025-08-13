const File = require('../models/File');
const Folder = require('../models/Folder');
const UserFile = require('../models/UserFile');

// Create a new file
async function createFile(req, res) {
  try {
    const { name, content = '', parentFolderId = null } = req.body;
    const ownerId = req.user._id;

    // Validate parent folder exists if provided (check globally, not just owner)
    if (parentFolderId) {
      const parentFolder = await Folder.findOne({ _id: parentFolderId });
      if (!parentFolder) {
        return res.status(400).json({ message: 'Parent folder not found' });
      }
    }

    // Check if file with same name already exists in the same folder (check globally)
    const existingFile = await File.findOne({ name, parentFolderId });
    if (existingFile) {
      return res.status(400).json({ message: 'File with this name already exists in this folder' });
    }

    // Create file metadata
    const file = new File({
      name,
      ownerId,
      parentFolderId,
      size: content.length
    });

    await file.save();

    // Create file content
    const userFile = new UserFile({
      fileId: file._id,
      content,
      lastModifiedBy: ownerId
    });

    await userFile.save();

    return res.status(201).json({
      message: 'File created successfully',
      file: {
        id: file._id,
        name: file.name,
        language: file.language,
        size: file.size,
        parentFolderId: file.parentFolderId,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        content
      }
    });
  } catch (error) {
    console.error('Create file error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Create a new folder
async function createFolder(req, res) {
  try {
    const { name, parentFolderId = null } = req.body;
    const ownerId = req.user._id;

    // Validate parent folder exists if provided (check globally, not just owner)
    if (parentFolderId) {
      const parentFolder = await Folder.findOne({ _id: parentFolderId });
      if (!parentFolder) {
        return res.status(400).json({ message: 'Parent folder not found' });
      }
    }

    // Check if folder with same name already exists in the same parent (check globally)
    const existingFolder = await Folder.findOne({ name, parentFolderId });
    if (existingFolder) {
      return res.status(400).json({ message: 'Folder with this name already exists in this location' });
    }

    const folder = new Folder({
      name,
      ownerId,
      parentFolderId
    });

    await folder.save();

    return res.status(201).json({
      message: 'Folder created successfully',
      folder: {
        id: folder._id,
        name: folder.name,
        parentFolderId: folder.parentFolderId,
        createdAt: folder.createdAt
      }
    });
  } catch (error) {
    console.error('Create folder error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get folder/file tree structure - now shows all files/folders globally
async function getTree(req, res) {
  try {
    // Build tree recursively - no owner restriction
    async function buildTree(parentFolderId = null) {
      const folders = await Folder.find({ parentFolderId }).sort({ name: 1 });
      const files = await File.find({ parentFolderId }).sort({ name: 1 });

      const tree = [];

      // Add folders first
      for (const folder of folders) {
        const children = await buildTree(folder._id);
        tree.push({
          type: 'folder',
          id: folder._id,
          name: folder.name,
          parentFolderId: folder.parentFolderId,
          createdAt: folder.createdAt,
          children
        });
      }

      // Add files
      for (const file of files) {
        tree.push({
          type: 'file',
          id: file._id,
          name: file.name,
          language: file.language,
          size: file.size,
          parentFolderId: file.parentFolderId,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt
        });
      }

      return tree;
    }

    const tree = await buildTree();
    return res.json({ tree });
  } catch (error) {
    console.error('Get tree error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get a specific file with content - now accessible to everyone
async function getFile(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Remove owner restriction - anyone can access any file
    const file = await File.findOne({ _id: id });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    let userFile = await UserFile.findOne({ fileId: id });
    
    // If no UserFile exists, create one with empty content
    if (!userFile) {
      userFile = new UserFile({
        fileId: id,
        content: '',
        lastModifiedBy: userId
      });
      await userFile.save();
      console.log(`Created UserFile entry for file: ${file.name}`);
    }

    return res.json({
      file: {
        id: file._id,
        name: file.name,
        language: file.language,
        size: file.size,
        parentFolderId: file.parentFolderId,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        content: userFile.content,
        version: userFile.version
      }
    });
  } catch (error) {
    console.error('Get file error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Update file content (auto-save) - now accessible to everyone
async function updateFile(req, res) {
  try {
    const { id } = req.params;
    const { content, name } = req.body;
    const userId = req.user._id;

    // Remove owner restriction - anyone can update any file
    const file = await File.findOne({ _id: id });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Update file metadata if name is provided
    if (name && name !== file.name) {
      // Check if new name conflicts with existing files in the same folder (check globally)
      const existingFile = await File.findOne({ 
        name, 
        parentFolderId: file.parentFolderId,
        _id: { $ne: id }
      });
      
      if (existingFile) {
        return res.status(400).json({ message: 'File with this name already exists in this folder' });
      }
      
      file.name = name;
    }

    // Update file content
    const userFile = await UserFile.findOne({ fileId: id });
    if (!userFile) {
      return res.status(404).json({ message: 'File content not found' });
    }

    if (content !== undefined) {
      userFile.content = content;
      userFile.lastModifiedBy = userId;
      file.size = content.length;
    }

    file.updatedAt = new Date();

    await Promise.all([file.save(), userFile.save()]);

    return res.json({
      message: 'File updated successfully',
      file: {
        id: file._id,
        name: file.name,
        language: file.language,
        size: file.size,
        updatedAt: file.updatedAt,
        version: userFile.version
      }
    });
  } catch (error) {
    console.error('Update file error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Delete a file - now accessible to everyone
async function deleteFile(req, res) {
  try {
    const { id } = req.params;
    // Remove owner restriction - anyone can delete any file
    const file = await File.findOne({ _id: id });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete both file metadata and content
    await Promise.all([
      File.findByIdAndDelete(id),
      UserFile.findOneAndDelete({ fileId: id })
    ]);

    return res.json({ 
      message: 'File deleted successfully',
      deletedFile: {
        id: file._id,
        name: file.name
      }
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Delete a folder recursively - now accessible to everyone
async function deleteFolder(req, res) {
  try {
    const { id } = req.params;
    // Remove owner restriction - anyone can delete any folder
    const folder = await Folder.findOne({ _id: id });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Recursively delete all files and subfolders
    async function deleteRecursively(folderId) {
      // Get all files in this folder (no owner restriction)
      const files = await File.find({ parentFolderId: folderId });
      
      // Delete all files and their content
      for (const file of files) {
        await Promise.all([
          File.findByIdAndDelete(file._id),
          UserFile.findOneAndDelete({ fileId: file._id })
        ]);
      }

      // Get all subfolders (no owner restriction)
      const subfolders = await Folder.find({ parentFolderId: folderId });
      
      // Recursively delete subfolders
      for (const subfolder of subfolders) {
        await deleteRecursively(subfolder._id);
        await Folder.findByIdAndDelete(subfolder._id);
      }
    }

    await deleteRecursively(id);
    await Folder.findByIdAndDelete(id);

    return res.json({ 
      message: 'Folder deleted successfully',
      deletedFolder: {
        id: folder._id,
        name: folder.name
      }
    });
  } catch (error) {
    console.error('Delete folder error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Rename a file - now accessible to everyone
async function renameFile(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'File name is required' });
    }

    // Remove owner restriction - anyone can rename any file
    const file = await File.findOne({ _id: id });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if new name conflicts with existing files in the same folder (check globally)
    const existingFile = await File.findOne({ 
      name: name.trim(), 
      parentFolderId: file.parentFolderId,
      _id: { $ne: id }
    });
    
    if (existingFile) {
      return res.status(400).json({ message: 'File with this name already exists in this folder' });
    }
    
    file.name = name.trim();
    file.updatedAt = new Date();
    await file.save();

    return res.json({
      message: 'File renamed successfully',
      file: {
        id: file._id,
        name: file.name,
        language: file.language,
        updatedAt: file.updatedAt
      }
    });
  } catch (error) {
    console.error('Rename file error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Rename a folder - now accessible to everyone
async function renameFolder(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    // Remove owner restriction - anyone can rename any folder
    const folder = await Folder.findOne({ _id: id });
    if (!folder) {
      return res.status(400).json({ message: 'Folder not found' });
    }

    // Check if new name conflicts with existing folders in the same parent (check globally)
    const existingFolder = await Folder.findOne({ 
      name: name.trim(), 
      parentFolderId: folder.parentFolderId,
      _id: { $ne: id }
    });
    
    if (existingFolder) {
      return res.status(400).json({ message: 'Folder with this name already exists in this location' });
    }
    
    folder.name = name.trim();
    await folder.save();

    return res.json({
      message: 'Folder renamed successfully',
      folder: {
        id: folder._id,
        name: folder.name
      }
    });
  } catch (error) {
    console.error('Rename folder error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createFile,
  createFolder,
  getTree,
  getFile,
  updateFile,
  deleteFile,
  deleteFolder,
  renameFile,
  renameFolder
};