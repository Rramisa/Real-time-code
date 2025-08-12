# CodeSync - Collaborative Code Editor

A real-time collaborative code editor built with the MERN stack (MongoDB, Express.js, React.js, Node.js) with user authentication and real-time collaboration features.

## Features

### Module 1: UI Management ✅
- [x] User registration, sign in, and password reset
- [x] Create, open, edit, and delete files in a shared file system
- [ ] Syntax highlighting with error detection
- [ ] Real-time chat functionality within files

### Module 2: AI and User Status Management
- [ ] Multiple users can edit files simultaneously with instant synchronization
- [ ] User presence (online/offline status)
- [ ] User profile management
- [ ] Download entire codebase as ZIP

### Module 3: Code Management
- [ ] Different themes based on user preferences
- [ ] Font type and size customization
- [ ] Code execution within the collaborative environment
- [ ] Built-in AI assistant for code generation and error detection
- [ ] Automatic programming language detection
- [ ] AI-powered code language conversion

## Tech Stack

- **Frontend**: React.js, Socket.io-client
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Real-time Communication**: Socket.io

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CSE471_Group8
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/collaborative-editor
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in your `.env` file.

5. **Start the development servers**

   **Start both the backend and frontend servers simultaneously:**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage

1. **Register a new account** or **Sign in** with existing credentials
2. **Access the collaborative editor** - all authenticated users share the same workspace
3. **Start coding collaboratively** - changes are synchronized in real-time
4. **Logout** when done

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/reset-password-confirm` - Confirm password reset

### User Profile
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update user profile (protected)

## Project Structure

```
CSE471_Group8/
├── .env
├── .gitignore  
├── README.md
├── SETUP.md
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── fileController.js
│   │   └── userController.js
│   ├── helper/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── File.js
│   │   ├── Folder.js
│   │   ├── User.js
│   │   └── UserFile.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── fileRoutes.js
│   │   └── userRoutes.js
│   ├── database.js
│   ├── index.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── ProtectedRoute.js
    │   │   └── VSCodeLayout.jsx
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Auth.css
    │   │   ├── ForgotPassword.js
    │   │   ├── home.js
    │   │   ├── Login.js
    │   │   └── Register.js
    │   ├── app.jsx
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Development

### Adding New Features

1. **Backend Changes**: Modify `server.js` for new API endpoints
2. **Frontend Changes**: Add new components in `src/components/` or pages in `src/pages/`
3. **Database Changes**: Update schemas in `server.js`

### Database Schema

**User Schema:**
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  profile: {
    preferredLanguages: [String],
    theme: String,
    fontSize: Number
  },
  createdAt: Date
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Team Members

- **Debjyoti** - Authentication, File Management, Real-time Collaboration
- **Ramisa** - Syntax Highlighting, User Status, Profile Management
- **Sadar** - Chat Functionality, Code Execution, AI Integration

## License

This project is part of CSE471 course work.

## Support

For issues and questions, please contact the development team.
