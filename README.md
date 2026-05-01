# ChatFlow Web

A premium, full-stack WhatsApp-inspired messaging application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO for real-time bidirectional communication.

## 🚀 Features

- **Real-Time Messaging**: Instant message delivery using Socket.IO.
- **WhatsApp UI**: High-fidelity dark/light mode interface with a 3-panel layout.
- **Authentication**: Simple and secure username/email-based login.
- **Persistent Storage**: All messages and user data are stored in MongoDB.
- **Theme Toggle**: Switch between Light and Dark modes.
- **Responsive Design**: Optimized for desktop and mobile viewing.

## 🛠️ Technology Stack

- **Frontend**: React, Lucide React (Icons), Axios, Socket.IO Client.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (via Mongoose).
- **Communication**: Socket.IO.

## 📂 Project Structure

### Backend (`/server`)
- `server.js`: Entry point and middleware setup.
- `routes/`: API endpoint definitions.
- `controllers/`: Logic for authentication, users, and messages.
- `models/`: Mongoose schemas for User and Message.
- `sockets/`: Socket.IO event handlers.

### Frontend (`/client`)
- `src/components/`: Reusable UI components (Sidebar, ChatList, ChatWindow, etc.).
- `src/pages/`: Main application pages (Login, Chat).
- `src/context/`: State management for Auth and Chat.
- `src/services/`: API communication layer.
- `src/socket/`: Socket initialization.

## ⚙️ Setup Instructions

### Prerequisites
- Node.js installed.
- MongoDB instance (local or Atlas).

### 1. Backend Setup
1. Navigate to the `server` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   ```
4. Start the server:
   ```bash
   node server.js
   ```

### 2. Frontend Setup
1. Navigate to the `client` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/login` | Login/Register a user |
| GET | `/api/users` | Fetch all registered users |
| GET | `/api/messages/:userId` | Get message history with a user |
| POST | `/api/messages` | Send a new message |

## 📸 Screenshots

*(Add screenshots here after deployment)*

---
Built with ❤️ by Antigravity.
