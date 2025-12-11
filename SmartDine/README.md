# 🍽️ SmartDine - AI-Powered Food Discovery App

A React Native mobile application that uses AI to provide personalized restaurant and food recommendations based on user preferences, dietary restrictions, and nutritional needs.

![React Native](https://img.shields.io/badge/React%20Native-0.73-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue)

---

## 📱 Features

### Core Functionality
- 🤖 **AI-Powered Recommendations** - Groq AI analyzes user queries for personalized suggestions
- 🔍 **Smart Search** - Keyword-based search with intelligent filtering
- 🗺️ **Restaurant Map** - Google Maps integration showing nearby restaurants
- 💪 **Nutritional Filtering** - Filter by protein, fiber, calories, and dietary restrictions
- 👤 **User Profiles** - Save taste preferences and dietary restrictions
- 📊 **Nutritional Information** - Complete nutritional data for all menu items

### Dietary Support
- Vegetarian & Vegan options
- Gluten-free filtering
- High protein meals (≥20g)
- High fiber meals (≥5g)
- Spice level indicators

### UI Features
- Modern, premium design with glassmorphism effects
- Smooth animations and micro-interactions
- Dark mode support
- Horizontal scrolling food cards
- Restaurant ratings and reviews

---

## 🏗️ Tech Stack

### Frontend (Mobile App)
- **Framework:** React Native 0.73
- **Language:** TypeScript
- **Navigation:** React Navigation
- **State Management:** React Context API
- **Maps:** React Native Maps (Google Maps)
- **HTTP Client:** Axios
- **UI:** Custom components with React Native Vector Icons

### Backend (API Server)
- **Framework:** FastAPI (Python)
- **Database:** MongoDB Atlas
- **AI:** Groq API (Llama 3.1)
- **Authentication:** JWT tokens
- **CORS:** Enabled for mobile development

### DevOps
- **Version Control:** Git/GitHub
- **Environment:** .env for configuration
- **Package Manager:** npm/yarn

---

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **MongoDB Atlas** account
- **Groq API** key
- **Google Maps API** key

---

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/SmartDine.git
cd SmartDine
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Backend Environment
Create `backend/.env`:
```bash
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
```

#### Populate Sample Data
```bash
python testing/comprehensive_sample_data.py
```

This adds **8 restaurants** with **38+ menu items** including:
- Spice Symphony (North Indian)
- The Fitness Kitchen (Healthy)
- Dosa Corner (South Indian)
- Pizza Paradise (Italian)
- The Burger Hub (American)
- Sushi Station (Japanese)
- Taco Fiesta (Mexican)
- The Chinese Wok (Chinese)

#### Start Backend Server
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd SmartDine
npm install
```

#### Configure Frontend Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```bash
# For Android Emulator
API_BASE_URL=http://10.0.2.2:8000

# For Physical Android Device (replace with your computer's IP)
API_BASE_URL=http://192.168.1.x:8000

# For iOS Simulator
API_BASE_URL=http://localhost:8000

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

#### Configure Google Maps (Android)
Add your API key to `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

### 4. Run the App

#### Android
```bash
npx react-native run-android
```

#### iOS (macOS only)
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

---

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `API_BASE_URL` | Backend API URL | `http://10.0.2.2:8000` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | `AIza...` |
| `APP_ENV` | Environment | `development` |

#### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `GROQ_API_KEY` | Groq AI API key | `gsk_...` |

### Getting API Keys

#### MongoDB Atlas
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string from "Connect" > "Connect your application"

#### Groq API
1. Sign up at [groq.com](https://groq.com)
2. Generate API key from dashboard

#### Google Maps
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project
3. Enable Maps SDK for Android/iOS
4. Create credentials > API Key

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication
Most endpoints require JWT token:
```bash
Authorization: Bearer <token>
```

### Endpoints

#### Authentication
```bash
# Sign Up
POST /auth/signup
Body: {"username": "user", "email": "user@email.com", "password": "pass"}

# Login
POST /auth/login
Body: {"username": "user", "password": "pass"}
Response: {"access_token": "...", "token_type": "bearer"}

# Get Current User
GET /auth/me
Headers: Authorization: Bearer <token>
```

#### Foods
```bash
# Get All Foods
GET /foods
Response: {"foods": [...], "count": 38}

# Filter Foods
GET /foods?high_protein=true
GET /foods?vegetarian=true
GET /foods?min_price=100&max_price=300
GET /foods?gluten_free=true
```

#### Restaurants
```bash
# Get All Restaurants
GET /restaurants
Response: {"restaurants": [...], "count": 8}
```

#### AI Recommendations
```bash
# Ask AI for Recommendations
POST /ai/ask
Headers: Authorization: Bearer <token>
Body: {"question": "I want high protein food"}
Response: {"answer": "AI response with recommendations"}
```

#### User Profile
```bash
# Get Profile
GET /profile
Headers: Authorization: Bearer <token>

# Update Profile
PUT /profile
Headers: Authorization: Bearer <token>
Body: {
  "name": "John Doe",
  "taste_preference": "modern",
  "dietary_restrictions": ["vegetarian", "high-protein"]
}

# Get Search History
GET /profile/history
Headers: Authorization: Bearer <token>
```

### Interactive API Docs
FastAPI provides automatic documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🎯 Usage Examples

### Sample Queries

**Health & Nutrition:**
- "I want high protein food"
- "Show me healthy low calorie meals"
- "High fiber vegetarian options"

**Cuisine-Based:**
- "Something spicy and Indian"
- "Traditional South Indian breakfast"
- "Italian comfort food"

**Dietary Restrictions:**
- "Vegetarian options under ₹200"
- "Gluten-free high protein meals"
- "Vegan food"

**Mood-Based:**
- "I'm feeling adventurous"
- "Comfort food for a cozy evening"
- "Quick and light lunch"

---

## 🗂️ Project Structure

```
SmartDine/
├── src/
│   ├── components/        # Reusable components
│   │   ├── FoodCard.tsx
│   │   ├── RestaurantCard.tsx
│   │   └── SearchBar.tsx
│   ├── screens/           # App screens
│   │   ├── Home.tsx
│   │   ├── Search.tsx
│   │   ├── Map.tsx
│   │   ├── Profile.tsx
│   │   └── Restaurant.tsx
│   ├── navigation/        # Navigation config
│   ├── services/          # API services
│   │   └── api.ts
│   ├── types/             # TypeScript types
│   └── config/            # App configuration
├── android/               # Android native code
├── ios/                   # iOS native code
├── .env                   # Environment variables
└── package.json

backend/
├── routers/
│   ├── ai.py              # AI recommendations
│   ├── auth.py            # Authentication
│   ├── foods.py           # Food endpoints
│   ├── profile.py         # User profile
│   └── restaurants.py     # Restaurant endpoints
├── testing/
│   ├── comprehensive_sample_data.py  # Data population
│   └── verify_data.py                # Data verification
├── db.py                  # Database connection
├── models.py              # Pydantic models
├── main.py                # FastAPI app
└── .env                   # Backend environment
```

---

## 🧪 Testing

### Backend Testing
```bash
# Verify database data
cd backend
python testing/verify_data.py

# Test API endpoint
curl http://localhost:8000/foods
curl http://localhost:8000/restaurants
```

### Frontend Testing
```bash
# Run Metro bundler with cache cleared
npm start -- --reset-cache

# Run on emulator/device
npx react-native run-android
```

### Test Checklist
- [ ] Backend returns 38 food items
- [ ] Foods display with ₹ symbol (not $)
- [ ] Search returns relevant results
- [ ] AI recommendations work
- [ ] Map shows restaurant locations
- [ ] Profile saves preferences
- [ ] Dietary filters work correctly

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
```bash
# Check MONGODB_URI in backend/.env
# Ensure IP whitelist includes your IP in MongoDB Atlas
# Verify cluster is running
```

**No Food Items Returned**
```bash
# Re-populate database
cd backend
python testing/comprehensive_sample_data.py
```

### Frontend Issues

**Unable to Connect to Backend**
```bash
# For Android Emulator, use:
API_BASE_URL=http://10.0.2.2:8000

# For Physical Device, use your computer's local IP:
ipconfig  # Windows
ifconfig  # Mac/Linux
# Then update .env with: http://YOUR_IP:8000
```

**Food Cards Not Showing**
1. Check backend is running: `curl http://localhost:8000/foods`
2. Verify API_BASE_URL in `.env`
3. Check Metro bundler logs for errors
4. Clear cache: `npm start -- --reset-cache`

**Metro Bundler Issues**
```bash
# Clear all caches
npx react-native start --reset-cache

# Or manually
rm -rf node_modules
rm -rf android/app/build
npm install
```

**Google Maps Not Working**
1. Verify API key in `.env` and `AndroidManifest.xml`
2. Enable Maps SDK in Google Cloud Console
3. Check API key restrictions

---

## 📊 Sample Data

The app comes with production-ready sample data:

### Statistics
- **8 Restaurants** across diverse cuisines
- **38+ Menu Items** with nutritional data
- **Price Range:** ₹80 - ₹550
- **Dietary Options:** 20+ vegetarian, 8+ vegan, 15+ high-protein

### Featured Items
- **Highest Protein:** Grilled Chicken Protein Bowl (45g) - ₹380
- **Highest Fiber:** Quinoa Buddha Bowl (12g) - ₹340
- **Best Value:** Medu Vada - ₹80
- **Most Expensive:** Salmon Sashimi - ₹550

### Dietary Breakdown
- 🥗 Vegetarian: 20+ items
- 🌱 Vegan: 8+ items
- 💪 High Protein (≥20g): 15+ items
- 🌾 High Fiber (≥5g): 14+ items
- 🌾 Gluten-Free: 8+ items

---

## 🔐 Security

### Best Practices Implemented
- ✅ Environment variables for secrets
- ✅ JWT authentication
- ✅ `.env` files in `.gitignore`
- ✅ API keys never committed
- ✅ MongoDB connection secured

### Important Files (Never Commit!)
- `.env` - API keys and secrets
- `google-services.json` - Firebase config
- `*.keystore` - Android signing keys
- `local.properties` - Local paths

---

## 🚢 Deployment

### Backend Deployment (Example: Render)
1. Push code to GitHub
2. Create account on [Render](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Set environment variables (MONGODB_URI, GROQ_API_KEY)
6. Deploy

### Mobile App Release

#### Android (Google Play)
```bash
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

#### iOS (App Store)
1. Open Xcode
2. Product > Archive
3. Distribute App > App Store Connect

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Authors

- Your Name - Initial work

---

## 🙏 Acknowledgments

- FastAPI for the excellent Python framework
- Groq for AI capabilities
- React Native community
- MongoDB for database solutions
- Google Maps Platform

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@smartdine.com

---

## 🗺️ Roadmap

- [ ] Add favorites/bookmarks
- [ ] Implement order tracking
- [ ] Social sharing features
- [ ] Restaurant reviews and ratings
- [ ] Voice search integration
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Push notifications

---

**Made with ❤️ using React Native and FastAPI**
