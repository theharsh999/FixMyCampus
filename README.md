# 🔧 FixMyCampus — Smart Campus Complaint System

A full-stack web application for reporting campus issues, tracking maintenance tickets, and ensuring accountability.

## 📁 Project Structure

```
FixMyCampus/
├── client/          → React frontend (Vite + Tailwind CSS)
├── server/          → Node.js + Express backend
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm
- MongoDB Atlas account (for database)

### 1. Frontend (Client)

```bash
cd client
npm install
npm run dev
```
Frontend runs at: **http://localhost:8080**

### 2. Backend (Server)

```bash
cd server
npm install
npm run dev
```
Backend runs at: **http://localhost:5000**

> **Note:** Update `server/.env` with your MongoDB Atlas connection string before starting the backend.

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React, Vite, Tailwind CSS, shadcn/ui |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB Atlas (Mongoose ODM)       |
| Routing   | React Router DOM                   |

## 📱 Features

- **Student Portal** — Submit complaints with title, category, location, description, and photo
- **Admin Dashboard** — View all complaints, assign staff, update status
- **Smart Priority** — Auto-flags urgent issues based on keywords
- **Real-time Status** — Track complaints: Pending → In Progress → Resolved
- **Dark Mode** — Full light/dark theme support

## 👤 Authors

Built with ❤️ for better campus life.
