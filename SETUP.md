# Setup Guide for CodeSync

## Quick Start (Without MongoDB - For Testing)

If you want to test the application without setting up MongoDB locally, you can:

1. **Use MongoDB Atlas (Cloud)**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster
   - Get your connection string
   - Update the `.env` file with your Atlas connection string

2. **Install MongoDB Locally**:
   ```bash
   # Option 1: Using Homebrew (if network issues persist)
   brew install mongodb/brew/mongodb-community
   brew services start mongodb-community
   
   # Option 2: Download from MongoDB website
   # Visit: https://www.mongodb.com/try/download/community
   ```

## Environment Variables

Create a `.env` file in the root directory:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/collaborative-editor

# For MongoDB Atlas (replace with your connection string)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collaborative-editor

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

## Starting the Application

1. **Start the backend server**:
   ```bash
   npm run server:dev
   ```

2. **Start the React frontend** (in a new terminal):
   ```bash
   npm start
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Testing the API

Test the registration endpoint:
```bash
curl http://localhost:5000/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

## Troubleshooting

### Port 5000 already in use
```bash
lsof -ti:5000 | xargs kill -9
```

### MongoDB connection issues
1. Check if MongoDB is running: `brew services list | grep mongodb`
2. Start MongoDB: `brew services start mongodb-community`
3. Check MongoDB logs: `tail -f /usr/local/var/log/mongodb/mongo.log`

### Network issues with Homebrew
Try using a different DNS or VPN connection.

## Features Implemented

✅ **Authentication System**:
- User registration
- User login
- Password reset
- JWT token-based authentication
- Protected routes

✅ **Real-time Collaboration**:
- Shared editor workspace
- Real-time code synchronization
- User presence (basic)

✅ **Modern UI**:
- Clean authentication pages
- Responsive design
- Toast notifications

## Next Steps

1. Set up MongoDB (local or Atlas)
2. Test the authentication flow
3. Implement file management features
4. Add syntax highlighting
5. Implement chat functionality 