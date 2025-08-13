# CodeSync - Collaborative Code Editor

A real-time collaborative code editor built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring a VS Code-like interface with user authentication and file management capabilities.

## Features

### Module 1: UI Management ✅
- [x] User registration, sign in, and password reset
- [x] VS Code-like interface with Monaco Editor
- [x] Create, open, edit, and delete files in a shared file system
- [x] File and folder management system
- [x] Responsive design with modern UI components

### Module 2: User Status Management ✅
- [x] JWT-based authentication system
- [x] Protected routes and user sessions
- [x] User profile management
- [x] Secure password reset functionality

### Module 3: Code Management 🚧
- [x] Monaco Editor integration for code editing
- [x] File upload and download capabilities
- [ ] Real-time collaborative editing
- [ ] Syntax highlighting with error detection
- [ ] Code execution within the collaborative environment
- [ ] Built-in AI assistant for code generation
- [ ] Different themes and customization options

## Tech Stack

- **Frontend**: React.js 19.1.1, Monaco Editor, React Router DOM, React Hot Toast, Axios
- **Backend**: Node.js, Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.17.0
- **Authentication**: JWT (JSON Web Tokens) 9.0.2
- **Password Hashing**: bcryptjs 2.4.3
- **Development**: Nodemon, Concurrently

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sum0nta/CSE471_Group8.git
   cd CSE471_Group8
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   This will install dependencies for the root project, backend, and frontend.

3. **Set up environment variables**
   Create a `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/codesync
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5001
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in your `.env` file.

5. **Start the development servers**
<<<<<<< HEAD
=======

   **Start both the backend and frontend servers simultaneously:**
>>>>>>> 0477622197cc2db3efe8a3ef5a5eb728f9c751dc
   ```bash
   npm run dev
   ```
   This single command will start both the backend and frontend servers concurrently.

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## Available Scripts

From the root directory:
- `npm run dev` - Start both frontend and backend servers
- `npm run backend:dev` - Start only the backend server
- `npm run frontend:dev` - Start only the frontend server
- `npm run install:all` - Install dependencies for all projects
- `npm run build` - Build the frontend for production

## Usage

1. **Register a new account** or **Sign in** with existing credentials
2. **Access the collaborative editor** - all authenticated users share the same workspace
3. **Start coding collaboratively** - changes are synchronized in real-time
4. **Logout** when done

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Confirm password reset

### User Management
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update user profile (protected)

### File Management
- `GET /api/files` - Get user's files (protected)
- `POST /api/files` - Create new file (protected)
- `PUT /api/files/:id` - Update file content (protected)
- `DELETE /api/files/:id` - Delete file (protected)
- `POST /api/files/upload` - Upload file (protected)

## Project Structure

```
CSE471_Group8/
<<<<<<< HEAD
=======
├── .env
├── .gitignore  
├── README.md
├── SETUP.md
>>>>>>> 0477622197cc2db3efe8a3ef5a5eb728f9c751dc
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
<<<<<<< HEAD
├── frontend/
│   ├── public/
│   │   ├── code-sync.png
│   │   ├── favicon.ico
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.js
│   │   │   └── VSCodeLayout.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Auth.css
│   │   │   ├── ForgotPassword.js
│   │   │   ├── home.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── app.jsx
│   │   └── index.js
│   └── package.json
├── package.json
├── README.md
└── SETUP.md
=======
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
>>>>>>> 0477622197cc2db3efe8a3ef5a5eb728f9c751dc
```

## Development

### Adding New Features

1. **Backend Changes**: 
   - Add new routes in `backend/routes/`
   - Create controllers in `backend/controllers/`
   - Define models in `backend/models/`
   - Update `backend/index.js` for new route imports

2. **Frontend Changes**: 
   - Add new components in `frontend/src/components/`
   - Add new pages in `frontend/src/pages/`
   - Update routing in `frontend/src/app.jsx`

3. **Database Changes**: 
   - Update schemas in `backend/models/`
   - Create migration scripts if needed

### Database Schema

**User Schema:**
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**File Schema:**
```javascript
{
  name: String (required),
  content: String,
  type: String (default: 'file'),
  size: Number,
  owner: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

**Folder Schema:**
```javascript
{
  name: String (required),
  parent: ObjectId (ref: 'Folder'),
  owner: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -am 'Add new feature'`)
6. Push to the branch (`git push origin feature/new-feature`)
7. Submit a pull request

## Team Members

- **Sumonta** - Project Lead, Backend Development, Authentication System
- **Team Member 2** - Frontend Development, UI/UX Design
- **Team Member 3** - Database Design, File Management System

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: 
   - Ensure MongoDB is running locally or check Atlas connection string
   - Verify `.env` file is in the `backend` directory

2. **Port Already in Use**:
   - Backend default port: 5001
   - Frontend default port: 3000
   - Change ports in respective package.json files if needed

3. **Dependencies Issues**:
   - Run `npm run install:all` to ensure all dependencies are installed
   - Clear node_modules and package-lock.json if issues persist

## License

This project is part of CSE471 course work at BRAC University.

## Support

For issues and questions, please contact the development team or create an issue in the repository.
