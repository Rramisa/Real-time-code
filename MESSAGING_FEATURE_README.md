# Messaging Feature Implementation

## Overview
This document describes the implementation of a messaging feature for the Collaborative Code Editor project. Users can now send messages to each other within specific files, enabling better collaboration and communication.

## Features Implemented

### Backend
1. **Message Model** (`backend/models/Message.js`)
   - Stores messages with sender, receiver, file context, and content
   - Supports different message types (text, code_snippet, file_comment)
   - Includes read/unread status and timestamps
   - Optimized with database indexes for efficient querying

2. **Message Controller** (`backend/controllers/messageController.js`)
   - `sendMessage`: Send a message to another user
   - `getFileMessages`: Get all messages for a specific file
   - `getConversation`: Get conversation between two users
   - `getUnreadCount`: Get count of unread messages
   - `markAsRead`: Mark a message as read
   - `deleteMessage`: Delete a message (sender only)

3. **Message Routes** (`backend/routes/messageRoutes.js`)
   - All routes are protected with authentication
   - RESTful API endpoints for messaging operations

4. **User Routes Update**
   - Added `/api/users` endpoint to get all users for messaging

### Frontend
1. **MessagePanel Component** (`frontend/src/components/MessagePanel.jsx`)
   - Floating chat panel with VSCode-like styling
   - User selection dropdown
   - Real-time message display
   - Message input with send functionality
   - Unread message counter
   - Auto-mark messages as read on hover
   - Delete own messages

2. **VSCodeLayout Integration**
   - Added message button in the header
   - Message panel opens/closes with button click
   - Messages are file-specific (current file context)

## Database Schema

```javascript
Message Schema:
{
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  fileId: ObjectId (ref: File),
  content: String (max 1000 chars),
  messageType: String (text, code_snippet, file_comment),
  lineNumber: Number (optional, for line-specific comments),
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

- `POST /api/messages/send` - Send a message
- `GET /api/messages/file/:fileId` - Get messages for a file
- `GET /api/messages/conversation/:otherUserId` - Get conversation with user
- `GET /api/messages/unread-count` - Get unread message count
- `PATCH /api/messages/read/:messageId` - Mark message as read
- `DELETE /api/messages/:messageId` - Delete a message
- `GET /api/users` - Get all users for messaging

## Usage

1. **Opening Messages**: Click the "💬 Messages" button in the header
2. **Selecting Recipient**: Choose a user from the dropdown
3. **Sending Messages**: Type your message and press Enter or click Send
4. **Viewing Messages**: Messages are displayed in chronological order
5. **File Context**: Messages are tied to the currently open file

## Security Features

- All routes require authentication
- Users can only delete their own messages
- Only message receivers can mark messages as read
- Input validation and sanitization
- Rate limiting considerations (can be added later)

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket/Socket.io for live messaging
2. **File Line Comments**: Click on line numbers to add specific comments
3. **Code Snippets**: Share code blocks within messages
4. **Notifications**: Browser notifications for new messages
5. **Message Search**: Search through message history
6. **File Sharing**: Share files through messages
7. **Group Messaging**: Multiple recipients for team collaboration

## Testing

To test the messaging feature:

1. Start the backend: `cd backend && npm start`
2. Start the frontend: `cd frontend && npm start`
3. Login with two different user accounts
4. Open a file in the editor
5. Click the Messages button
6. Select the other user and send a message
7. Verify messages appear and can be marked as read

## Dependencies

### Backend
- mongoose (already included)
- express (already included)
- JWT authentication (already included)

### Frontend
- react-hot-toast (already included)
- No additional dependencies required

## Notes

- This implementation is **not real-time** as requested
- Messages are stored in MongoDB for persistence
- The UI follows the existing VSCode-like design pattern
- All messaging operations are file-specific for better context
- The feature integrates seamlessly with the existing codebase
