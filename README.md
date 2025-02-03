# 📌 URL Shortener - MERN Stack 🚀

## 🌍 Overview
A **URL Shortener Service** built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)** with **MySQL as the database** instead of MongoDB. This project allows users to shorten long URLs, create custom short links, and track click metrics.

## ✨ Features
✅ **Shorten Long URLs** – Generate a short link for any long URL.  
✅ **Custom Short URLs** – Users can create custom URLs with a unique alias.  
✅ **Analytics & Metrics** – Track the number of clicks on each short URL.  
✅ **High Performance** – Load balancing and caching mechanisms for speed.  
✅ **RESTful API** – Easily integrate with third-party apps.  
✅ **Deployed for Free Testing** – Hosted backend on Render & database on Planetscale.  

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS 🎨  
- **Backend**: Node.js, Express.js 🛠️  
- **Database**: MySQL (using Planetscale) 💾  
- **Caching**: Redis ⚡  
- **Deployment**: Render (Backend) & GitHub 🚀  
- **Version Control**: Git & GitHub 🛡️  

## 📂 Project Structure
```
📁 project-final
 ┣ 📁 backend
 ┃ ┣ 📜 server.js  # Main backend file
 ┃ ┣ 📜 routes.js  # API Routes
 ┃ ┣ 📜 config.js  # Database & Redis Config
 ┃ ┣ 📜 package.json  # Dependencies
 ┃ ┗ 📁 controllers # Business Logic
 ┣ 📁 frontend
 ┃ ┣ 📜 App.js  # Main React File
 ┃ ┣ 📜 index.js  # React Entry Point
 ┃ ┗ 📜 styles.css  # Styling
 ┣ 📜 .gitignore  # Ignore node_modules & env files
 ┣ 📜 README.md  # Project Documentation
```

## 🚀 Getting Started
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/yourusername/project-final.git
cd project-final
```

### 2️⃣ Backend Setup
```sh
cd backend
npm install  # Install dependencies
npm start  # Start backend server
```

### 3️⃣ Frontend Setup
```sh
cd frontend
npm install  # Install dependencies
npm start  # Start frontend server
```

### 4️⃣ Environment Variables (Create a `.env` file in backend)
```env
PORT=5000
DB_URL=your-mysql-database-url
REDIS_URL=your-redis-url
```

## 📊 Metrics & Analytics
- **Clicks per Region** – Tracks user visits based on location.
- **Shortened URL Performance** – Monitors popular links.
- **API Usage Statistics** – Measures API call frequency.

## 🔗 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/create` | Shorten a long URL |
| GET    | `/{short_url}` | Redirects to the original URL |
| GET    | `/metrics/{short_url}` | Fetch URL analytics |

## 🌎 Live Demo
🔗 **Backend:** Will upload soon
🔗 **Frontend:** Will upload soon


---
💡 **Contributions are welcome!** Fork the repo, make changes, and submit a PR. 🚀

