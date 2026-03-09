# 🚨 Dhor (ধর!) 
**"Crime dekhlei... Dhor!"**

## 📖 Overview
**Dhor** is a crowdsourced, map-based community safety and crime reporting platform built on the MERN stack. It empowers ordinary citizens to report incidents instantly, alerts nearby users of dangerous zones, and provides law enforcement with real-time, verified data to track and stop crime. 

Powered by AI and community verification, Dhor bridges the gap between public safety and police action.



## ✨ Key Features

### 👤 For Users (Citizens)
* **Interactive Crime Map:** Drop a pin exactly where an incident happened using an intuitive OpenStreetMap interface.
* **The "Crowd Jury" (Verification):** Combat fake news. Users can upvote or downvote reports to verify authenticity before they trigger public alerts.
* **Smart AI Assistant:** A built-in chatbot that can translate natural language into database queries ("Show me snatching incidents in Dhanmondi"), provide basic legal advice based on the Penal Code, and summarize local crime trends.
* **Anonymous Reporting & Safety Modes:** Designed with victim safety in mind.

### 👮 For Law Enforcement (Police Admin)
* **Real-time Heatmaps:** Visualize crime density and predict high-risk zones.
* **Case Management Dashboard:** Update the status of community reports (`Pending` ➝ `Investigating` ➝ `Resolved`), turning red map pins into green ones to show public progress.
* **Trend & Pattern Analysis:** Quickly identify serial offenses in specific Thanas or Districts.

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS, Vite
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (with Geospatial & Text Indexing)
* **Mapping:** Leaflet & React-Leaflet (OpenStreetMap)

---

## 📁 Project Structure

```
Dhor/
├── Backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── models/
│   │   └── User.js              # User schema
│   ├── routes/
│   │   └── authRoutes.js        # Auth endpoints
│   ├── .env                     # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── server.js                # Entry point
│
└── Frontend/
    ├── src/
    │   ├── data/
    │   │   └── locations.js     # Bangladesh districts & thanas (64 districts, 514+ thanas)
    │   ├── pages/
    │   │   └── Register.jsx     # Registration component
    │   ├── services/
    │   │   └── api.js           # API service layer
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (already configured)

### Backend Setup

1. **Navigate to Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables are pre-configured** in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://dhor:dhor@dhor.gstmxgu.mongodb.net/
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   ```

4. **Start the backend server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Or production mode
   npm start
   ```
   
   ✅ Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to Frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   ✅ Frontend runs on `http://localhost:3000`

### Running Both Servers

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

## 📡 API Endpoints (User Registration)

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "district": "Dhaka",
  "thana": "Gulshan",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "district": "Dhaka",
    "thana": "Gulshan",
    "role": "user",
    "isVerified": false
  }
}
```

### Health Check
```http
GET /api/health
```

## 🗺️ Location Data

The app includes comprehensive location data for Bangladesh:
- **64 Districts** (Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, Barisal, Rangpur, Mymensingh, etc.)
- **514+ Thanas/Upazilas** covering all districts
- Cascading dropdown (District → Thana) in registration form

## ✅ Implemented Features

### ✓ User Registration System
- Full-featured registration form with Tailwind CSS
- Cascading district/thana dropdowns
- Role-based registration (User/Police)
- Password hashing with bcrypt (10 salt rounds)
- Email validation and uniqueness check
- Success/Error message handling
- Loading states

### ✓ Backend API
- Express.js server with CORS
- MongoDB integration with Mongoose
- User model with validation
- Authentication controller
- Environment variable configuration

### ✓ Security
- Password hashing
- Email validation
- Unique email constraint
- Environment variables for sensitive data

## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.2.0",
  "bcrypt": "^5.1.1",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "axios": "^1.6.7",
  "react-router-dom": "^6.22.0",
  "tailwindcss": "^3.4.1",
  "vite": "^5.1.4"
}
```

## 🎯 Next Steps / Roadmap

- [ ] JWT token generation and authentication
- [ ] Login functionality
- [ ] Email verification system
- [ ] Password reset feature
- [ ] Crime reporting with map integration
- [ ] AI chatbot for legal assistance
- [ ] Verification system (upvote/downvote)
- [ ] Police dashboard
- [ ] Real-time notifications
- [ ] Heatmap visualization
- [ ] Analytics and reporting

---

**Built with ❤️ for safer communities in Bangladesh**
