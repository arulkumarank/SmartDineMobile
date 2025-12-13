# 🍽️ DeltaForge - SmartDine Project

A full-stack AI-powered food discovery platform consisting of a **React Native mobile app** and a **FastAPI backend**.

---

## 📁 Project Structure

```
DeltaForge/
├── SmartDine/          # React Native Mobile App (Frontend)
│   ├── src/            # Source code (screens, components, services)
│   ├── android/        # Android native code
│   └── package.json    # Node.js dependencies
│
├── backend/            # FastAPI Server (Backend)
│   ├── routers/        # API endpoints (ai, auth, foods, profile, restaurants)
│   ├── services/       # Vector search & FAISS index
│   ├── testing/        # Sample data & test scripts
│   └── main.py         # FastAPI application entry
│
└── README.md           # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.8+ with pip
- **Android Studio** (for mobile app development)
- **MongoDB Atlas** account
- **Groq AI** API key
- **Google Maps** API key

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install fastapi uvicorn pymongo python-dotenv passlib python-jose bcrypt requests

# Configure environment
# Create .env with:
# MONGODB_URI=your_mongodb_connection_string
# GROQ_API_KEY=your_groq_api_key

# Populate database with sample data
python testing/comprehensive_sample_data.py

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`  
API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd SmartDine

# Install dependencies
npm install

# Configure environment
# Edit .env with:
# API_BASE_URL=http://10.0.2.2:8000 (emulator) or http://YOUR_IP:8000 (device)
# GOOGLE_MAPS_API_KEY=your_key

# Start Metro bundler
npx react-native start --reset-cache

# Run on Android (in new terminal)
npx react-native run-android
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/foods` | GET | Get all food items with filters |
| `/restaurants` | GET | Get all restaurants with locations |
| `/auth/signup` | POST | Register new user |
| `/auth/login` | POST | Login and get JWT token |
| `/auth/me` | GET | Get current user info |
| `/profile` | GET/PUT | Get/update user profile |
| `/profile/history` | GET | Get search history |
| `/ai/ask` | POST | AI-powered food recommendations |

---

## ✨ Features

- 🤖 **AI Recommendations** - Groq AI for personalized food suggestions
- 🔍 **Smart Search** - Filter by diet, price, nutrition
- 🗺️ **Restaurant Map** - Google Maps integration
- 💪 **Nutrition Tracking** - Protein, fiber, calories info
- 👤 **User Profiles** - Save preferences and dietary restrictions
- 🌙 **Dark Mode** - Full theme support

---

## 📖 Documentation

- **Frontend README**: [SmartDine/README.md](./SmartDine/README.md)
- **Swagger API Docs**: http://localhost:8000/docs (when server is running)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile** | React Native 0.73, TypeScript |
| **Backend** | FastAPI (Python) |
| **Database** | MongoDB Atlas |
| **AI** | Groq API (Llama 3.1) |
| **Maps** | Google Maps Platform |
| **Auth** | JWT Tokens |

---

## 📝 License

MIT License

---

**Made with ❤️ using React Native and FastAPI**
