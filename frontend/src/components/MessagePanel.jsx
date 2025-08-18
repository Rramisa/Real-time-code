import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const MessagePanel = ({ fileId, fileName, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Removed unread count since messages are now file-based
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  
  // Get the correct user ID (handle both user.id and user._id)
  const getCurrentUserId = () => {
    return user?.id || user?._id;
  };

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

  // Fetch messages for the current file
  const fetchMessages = async () => {
    if (!fileId) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/messages/file/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
        scrollToBottom();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  };

  // No need to fetch users anymore - all messages are file-based

  // No need for unread count in file-based messaging

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('=== SENDING MESSAGE DEBUG ===');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('File ID:', fileId);
      console.log('Message Content:', newMessage.trim());
      console.log('API URL:', `${API_BASE_URL}/api/messages/send`);
      
      const requestBody = {
        fileId: fileId,
        content: newMessage.trim(),
        messageType: 'text'
      };
      console.log('Request Body:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Message sent successfully:', data);
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        scrollToBottom();
        toast.success('Message sent successfully');
        // Refresh messages to show the new message
        fetchMessages();
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to send message:', errorData);
        toast.error(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Network/Other error:', error);
      toast.error('Failed to send message');
    }
  };

  // No need for mark as read in file-based messaging

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        toast.success('Message deleted successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Effects
  useEffect(() => {
    console.log('MessagePanel useEffect triggered:', { isOpen, fileId, user: user?.username });
    console.log('MessagePanel fileId type:', typeof fileId, 'value:', fileId);
    if (isOpen && fileId) {
      console.log('MessagePanel opened for file:', fileId); // Debug log
      console.log('Current user:', user); // Debug log
      console.log('Current user ID:', getCurrentUserId()); // Debug log
      console.log('=== MESSAGE PANEL DEBUG ===');
      fetchMessages();
    }
  }, [isOpen, fileId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;
  
  // Check if fileId is available
  if (!fileId) {
    return (
      <div style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        width: '350px',
        height: '500px',
        backgroundColor: '#2d2d30',
        border: '1px solid #3e3e42',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #3e3e42',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'white' }}>
            File Discussion
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#cccccc',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0'
            }}
          >
            ×
          </button>
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          textAlign: 'center',
          color: '#cccccc'
        }}>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
            <div>No file selected</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              Please select a file to start a discussion
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      width: '350px',
      height: '500px',
      backgroundColor: '#2d2d30',
      border: '1px solid #3e3e42',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #3e3e42',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'white' }}>
            File Discussion
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#cccccc',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0'
            }}
          >
            ×
          </button>
        </div>
        <div style={{ fontSize: '10px', color: '#888' }}>
          File-based Discussion | File: {fileName || fileId}
        </div>
      </div>

            {/* File Discussion Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #3e3e42' }}>
        <div style={{ fontSize: '12px', color: '#cccccc', textAlign: 'center' }}>
          💬 Discuss this file with your team
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#cccccc' }}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#cccccc' }}>No messages yet</div>
        ) : (
          messages.map(message => (
            <div
              key={message._id}
                             style={{
                 padding: '12px',
                 backgroundColor: message.senderId._id === getCurrentUserId() ? '#007acc' : '#3e3e42',
                 borderRadius: '8px',
                 maxWidth: '80%',
                 alignSelf: message.senderId._id === getCurrentUserId() ? 'flex-end' : 'flex-start',
                 position: 'relative'
               }}
               // No need for mark as read in file-based messaging
            >
              <div style={{
                fontSize: '12px',
                color: '#cccccc',
                marginBottom: '4px'
              }}>
                                 {message.senderId.username}
                 {message.senderId._id === getCurrentUserId() && (
                   <span style={{ marginLeft: '8px', opacity: 0.7 }}>
                     {formatTime(message.createdAt)}
                   </span>
                 )}
              </div>
              <div style={{ color: 'white', wordBreak: 'break-word' }}>
                {message.content}
              </div>
                             {message.senderId._id === getCurrentUserId() && (
                 <button
                   onClick={() => deleteMessage(message._id)}
                   style={{
                     position: 'absolute',
                     top: '4px',
                     right: '4px',
                     background: 'none',
                     border: 'none',
                     color: '#cccccc',
                     cursor: 'pointer',
                     fontSize: '12px',
                     padding: '2px'
                   }}
                 >
                   ×
                 </button>
               )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #3e3e42',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#1e1e1e',
            border: '1px solid #3e3e42',
            borderRadius: '4px',
            color: 'white',
            fontSize: '14px'
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
                 <button
           onClick={sendMessage}
           disabled={!newMessage.trim()}
           style={{
             padding: '8px 16px',
             backgroundColor: newMessage.trim() ? '#007acc' : '#404040',
             color: 'white',
             border: 'none',
             borderRadius: '4px',
             cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
             fontSize: '14px'
           }}
         >
           Send
         </button>
      </div>
    </div>
  );
};

export default MessagePanel;
