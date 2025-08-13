const Message = require('../models/Message');
const User = require('../models/User');
const File = require('../models/File');

// Send a message to the file
const sendMessage = async (req, res) => {
  try {
    const { fileId, content, messageType = 'text', lineNumber = null } = req.body;
    const senderId = req.user.id;

    // Validate required fields
    if (!fileId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'File ID and content are required' 
      });
    }

    // Check if file exists
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }

    // Create new message
    const message = new Message({
      senderId,
      fileId,
      content,
      messageType,
      lineNumber
    });

    await message.save();

    // Populate sender and file details for response
    await message.populate([
      { path: 'senderId', select: 'username email' },
      { path: 'fileId', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get messages for a specific file
const getFileMessages = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    // Check if file exists
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }

    // Get all messages for the file
    const messages = await Message.find({
      fileId
    })
    .populate('senderId', 'username email')
    .populate('fileId', 'name')
    .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Error getting file messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// These functions are no longer needed for file-based messaging

// Delete a message (only sender can delete)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    // Only the sender can delete the message
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to delete this message' 
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  sendMessage,
  getFileMessages,
  deleteMessage
};
