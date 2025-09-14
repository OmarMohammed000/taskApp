# TaskApp

A full-stack task management application with real-time features, user authentication, and gamification elements including XP and levels.

## Project Description

TaskApp is a comprehensive task management system that combines productivity with gamification. Users can create, manage, and complete tasks while earning experience points (XP) and progressing through levels. The application features real-time updates, tag-based task organization, and an admin dashboard for user and system management.

## Key Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Task Management**: Create, edit, delete, and complete tasks
- **Gamification**: XP system with levels and leaderboards
- **Real-time Updates**: Live updates using Socket.IO
- **Tag System**: Organize tasks with customizable tags
- **Admin Dashboard**: User and tag management for administrators
- **Responsive Design**: Modern React-based frontend

## Technologies Used

### Backend
- Node.js with TypeScript
- Express.js - Web framework
- Sequelize - ORM for database operations
- PostgreSQL - Primary database
- Socket.IO - Real-time communication
- JWT - Authentication tokens
- bcryptjs - Password hashing
- Jest - Unit testing

### Frontend
- React with TypeScript
- Context API - State management
- Socket.IO Client - Real-time features
- CSS Modules - Styling

## Database Schema

### Tables Structure

**Levels**
- `id` (Primary Key)
- `level_name` - Level identifier
- `requierd_xp` -  XP required

**Users**
- `id` (Primary Key)
- `name` - User's display name
- `email` - Unique email address
- `password_hash` - Encrypted password
- `xp` - Current experience points
- `isAdmin` - Admin privileges flag
- `level_id` (Foreign Key to Levels)
- `refresh_token` - JWT refresh token

**Tasks**
- `id` (Primary Key)
- `title` - Task title
- `description` - Task details
- `priority` - Task priority level
- `status` - Completion status
- `xp_reward` - XP earned on completion
- `user_id` (Foreign Key to Users)

**Tags**
- `id` (Primary Key)
- `name` - Tag name
- `color` - Display color

**Task_Tags** (Junction Table)
- `task_id` (Foreign Key to Tasks)
- `tag_id` (Foreign Key to Tags)

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskApp
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the server directory with the following variables:
   ```env
   PORT=4000
   DB_HOST=localhost
   DB_PORT=db_port
   DB_NAME=taskapp_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
   BCRYPT_SALT_ROUNDS=10
   NODE_ENV=development
   ```

4. **Set up the database**
   
   Create a PostgreSQL database named `taskapp_db` (or whatever you specified in DB_NAME)

5. **Run database migrations**
   ```bash
   npx sequelize-cli db:migrate:all
   ```

6. **Seed the database with initial data**
   ```bash
   npx sequelize-cli db:seed:all
   ```

7. **Build and start the server**
   ```bash
   npm run build
   npm run start
   ```

The server will start on port 4000 (or the PORT specified in your .env file)

### Frontend Setup

1. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run start
   ```

The client will start on http://localhost:3000

## Default Credentials

After seeding, you can log in with these test accounts:

- **Admin**: email: `admin.admin@example.com`, password: `admin`
- **Regular Users**: email: `jane.smith@example.com`, password: `password123`

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token

### Tasks
- `GET /tasks` - Get user's tasks
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PATCH /tasks/:id/complete` - Mark task as complete

### Users
- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (admin only)
- `GET /users/leaderboard` - Get user leaderboard

### Tags
- `GET /tags` - Get all tags
- `POST /tags` - Create new tag 
- `PUT /tags/:id` - Update tag
- `DELETE /tags/:id` - Delete tag 

## Additional Notes

### Security Features
- Password hashing with bcrypt
- JWT-based authentication with refresh tokens
- Input sanitization to prevent unsafe characters
- CORS configuration for secure cross-origin requests

### Real-time Features
- Live leaderboard updates
- Real-time task notifications
- Socket.IO authentication middleware

### Admin Features
- User management (view, edit, delete users)
- Tag management (create, edit, delete tags)
- System oversight capabilities

### Assumptions
- PostgreSQL is used as the primary database
- The application runs in a development environment by default
- Frontend is served on port 3000, backend on port 4000
- Users start at level 1 with 0 XP
- Task completion rewards are configurable per task

### Development
- TypeScript is used throughout for type safety
- Sequelize ORM handles database operations
- Migration files manage database schema changes
- Seeders provide initial data for development/testing

### Testing
- Unit tests are available for authentication controllers And tag ones
- Run tests with `npm test` in the server directory

For any issues or questions, please refer to the error logs or create an issue in the repository.
