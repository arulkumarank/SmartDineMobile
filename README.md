# DeltaForge - SmartDine Project

A full-stack AI-powered food discovery platform consisting of a **React Native mobile app** and a **FastAPI backend** with vector search capabilities for intelligent food recommendations.

---

## Project Architecture

```
DeltaForge/
├── SmartDine/                          # React Native Mobile App (Frontend)
│   ├── src/
│   │   ├── screens/                    # UI screens
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx           # User login screen
│   │   │   │   └── Signup.tsx          # User registration screen
│   │   │   ├── main/
│   │   │   │   ├── Home.tsx            # Main home screen with AI recommendations
│   │   │   │   ├── Search.tsx          # Food search with filters
│   │   │   │   ├── Cart.tsx            # Shopping cart management
│   │   │   │   ├── Profile.tsx         # User profile and preferences
│   │   │   │   ├── Map.tsx             # Restaurant map view
│   │   │   │   └── SurpriseMe.tsx      # Random food suggestions
│   │   │   ├── details/
│   │   │   │   ├── FoodDetail.tsx      # Detailed food item view
│   │   │   │   └── Restaurant.tsx      # Restaurant details
│   │   │   └── settings/
│   │   │       ├── Settings.tsx        # App settings
│   │   │       └── Notifications.tsx   # Notification center
│   │   │
│   │   ├── components/                 # Reusable UI components
│   │   │   ├── cards/                  # Card components
│   │   │   │   ├── FoodCard.tsx        # Food item card component
│   │   │   │   └── RestaurantCard.tsx  # Restaurant card component
│   │   │   ├── common/                 # Common UI elements
│   │   │   │   ├── SearchBar.tsx       # Search input component
│   │   │   │   ├── ProfileHeader.tsx   # Profile header with dropdown
│   │   │   │   ├── Skeleton.tsx        # Loading skeleton screens
│   │   │   │   └── StyledAlert.tsx     # Custom alert component
│   │   │   └── layout/                 # Layout components
│   │   │
│   │   ├── navigation/
│   │   │   └── BottomTabs.tsx          # Bottom tab navigation
│   │   │
│   │   ├── context/                    # Global state management
│   │   │   ├── AuthContext.tsx         # Authentication state
│   │   │   ├── ThemeContext.tsx        # Dark/light mode theme
│   │   │   ├── CartContext.tsx         # Shopping cart state
│   │   │   └── NotificationsContext.tsx # Notifications state
│   │   │

│   │   ├── services/
│   │   │   └── api.ts                  # API integration layer
│   │   │
│   │   ├── hooks/                      # Custom React hooks
│   │   │
│   │   ├── assets/                     # Static resources
│   │   │   ├── images/                 # Image files
│   │   │   └── fonts/                  # Custom fonts
│   │   │
│   │   ├── styles/                     # Global styles and themes
│   │   │
│   │   ├── constants/                  # App-wide constants
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript type definitions
│   │   │
│   │   ├── utils/                      # Helper functions
│   │   │
│   │   └── App.tsx                     # Main application component
│   │
│   ├── index.js                        # Entry point
│   ├── android/                        # Android native configuration
│   │   ├── app/
│   │   │   ├── build.gradle            # App-level Gradle config
│   │   │   └── src/                    # Android source files
│   │   └── build.gradle                # Project-level Gradle config
│   │
│   ├── package.json                    # Node.js dependencies
│   ├── tsconfig.json                   # TypeScript configuration
│   └── .env                            # Environment variables
│
├── backend/                            # FastAPI Server (Backend)
│   ├── routers/                        # API endpoints
│   │   ├── ai.py                       # AI recommendation endpoints
│   │   ├── auth.py                     # Authentication (signup/login)
│   │   ├── foods.py                    # Food item CRUD operations
│   │   ├── profile.py                  # User profile management
│   │   ├── restaurants.py              # Restaurant data endpoints
│   │   └── feedback.py                 # User feedback endpoints
│   │
│   ├── services/                       # Business logic services
│   │   ├── vector_search.py            # FAISS vector search engine
│   │   ├── rl_recommender.py           # Reinforcement learning recommender
│   │   ├── email_service.py            # Email notification service
│   │   └── faiss_index/                # Persisted vector index files
│   │
│   ├── utils/                          # Utility modules
│   │   ├── security.py                 # JWT token and password hashing
│   │   └── groq.py                     # Groq AI client wrapper
│   │
│   ├── testing/                        # Sample data and test scripts
│   │   ├── comprehensive_sample_data.py # Database seeding script
│   │   └── ...                         # Various test files
│   │
│   ├── main.py                         # FastAPI application entry point
│   ├── models.py                       # Pydantic data models
│   ├── db.py                           # MongoDB connection
│   ├── init_vectors.py                 # Vector index initialization
│   ├── requirements.txt                # Python dependencies
│   └── .env                            # Environment variables
│
└── README.md                           # This file
```

---

## Complete Project Flow

### 1. Initial Setup

#### Backend Initialization
1. **Environment Setup**
   - Clone repository
   - Create Python virtual environment
   - Install dependencies from `requirements.txt`
   
2. **Database Configuration**
   - Set up MongoDB Atlas account
   - Create database cluster
   - Configure connection string in `.env`

3. **API Keys Configuration**
   - Obtain Groq AI API key
   - Add to backend `.env` file

4. **Data Population**
   - Run `comprehensive_sample_data.py` to seed database with restaurants and menu items
   - Script creates embedded menu structure with nutritional information
   - Each restaurant includes location data for maps integration

5. **Vector Index Initialization**
   - Run `init_vectors.py` to build FAISS index
   - Creates embeddings for semantic food search
   - Index stored in `services/faiss_index/`

6. **Server Launch**
   - Start FastAPI server with `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
   - Access API documentation at `http://localhost:8000/docs`

#### Frontend Initialization
1. **Environment Setup**
   - Navigate to SmartDine directory
   - Install Node.js dependencies with `npm install`
   
2. **Configuration**
   - Create `.env` file
   - Set `API_BASE_URL` (use `10.0.2.2:8000` for emulator or local IP for physical device)
   - Add Google Maps API key for restaurant locations

3. **Android Setup**
   - Open project in Android Studio
   - Configure `build.gradle` files
   - Ensure compileSdkVersion and targetSdkVersion are set

4. **Launch Application**
   - Start Metro bundler: `npx react-native start --reset-cache`
   - Build and run: `npx react-native run-android`

### 2. Application Flow

#### User Authentication
1. **Registration Flow**
   - User opens app and navigates to signup screen
   - Enters email, password, name, dietary preferences
   - Frontend sends POST to `/auth/signup`
   - Backend hashes password with bcrypt
   - User document created in MongoDB `users` collection
   - JWT token returned and stored in AuthContext

2. **Login Flow**
   - User enters credentials
   - Frontend sends POST to `/auth/login`
   - Backend validates credentials
   - JWT token issued and stored locally
   - User redirected to Home screen

#### Home Screen Experience
1. **Initial Load**
   - App fetches user profile from `/auth/me`
   - Theme preference loaded (light/dark mode)
   - Notification system initialized

2. **AI Recommendations**
   - User enters natural language query (e.g., "healthy breakfast under $10")
   - Frontend sends POST to `/ai/ask` with user request
   - Backend processes request through Groq AI (Llama 3.1 model)
   - AI analyzes user preferences, dietary restrictions, and request
   - Vector search performed using FAISS index for semantic matching
   - Relevant food items returned with restaurant information
   - Results displayed as cards with images, nutrition, and pricing

#### Search and Discovery
1. **Browse Foods**
   - User navigates to Search screen
   - GET request to `/foods` with optional filters
   - Filter by dietary type (vegan, gluten-free, etc.)
   - Filter by price range
   - Filter by nutritional criteria (protein, calories, fiber)
   - Results displayed in scrollable card layout

2. **Restaurant Discovery**
   - User views `/restaurants` endpoint
   - Each restaurant shows embedded menu items
   - Location data displayed on Google Maps
   - User can tap to navigate via Google Maps app

#### Food Detail View
1. **Detailed Information**
   - User taps on food card
   - Navigate to FoodDetail screen
   - Display comprehensive information:
     - High-quality food images
     - Full nutritional breakdown
     - Dietary tags (vegan, organic, spicy, etc.)
     - Restaurant information
     - Price and availability

2. **Cart Management**
   - User adds items to cart via CartContext
   - Cart state persisted across navigation
   - Quantity adjustments managed globally

#### Profile Management
1. **View Profile**
   - GET request to `/profile`
   - Display user information, preferences, dietary restrictions
   - Show search history from `/profile/history`

2. **Update Profile**
   - User modifies preferences or personal info
   - PUT request to `/profile`
   - Changes reflected immediately in UI
   - Affects future AI recommendations

#### Notifications System
- Global notification context tracks messages
- Logout confirmations routed to notification screen
- Payment updates and order status displayed
- All popup messages centralized for better UX

### 3. Backend Processing Flow

#### Request Handling
1. **API Request Reception**
   - Request hits FastAPI endpoint
   - JWT token validated (if protected route)
   - Request body parsed and validated with Pydantic models

2. **Database Operations**
   - MongoDB connection established via `db.py`
   - Queries executed on respective collections
   - Data transformed to match response models

3. **AI Processing**
   - User query sent to Groq API
   - Context includes user preferences and restrictions
   - AI generates structured food recommendations
   - Vector search finds semantically similar items

4. **Response Formation**
   - Data serialized to JSON
   - Response returned to frontend
   - Error handling for failures

### 4. Data Flow

#### MongoDB Collections
- **users**: User accounts, preferences, dietary restrictions
- **restaurants**: Restaurant data with embedded menu items
- **search_history**: User search logs for personalization

#### Vector Search System
- **Embeddings**: Generated for all menu items
- **FAISS Index**: Enables fast similarity search
- **Semantic Matching**: Finds foods based on meaning, not just keywords

### 5. Theme System
- ThemeContext provides dark/light mode
- All components theme-aware
- Smooth transitions between modes
- Preference saved in user profile

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ with pip
- **Android Studio** (for mobile development)
- **Physical Android device** or emulator
- **MongoDB Atlas** account
- **Groq AI** API key
- **Google Maps** API key

---

## Installation Guide

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file with:
# MONGODB_URI=your_mongodb_connection_string
# GROQ_API_KEY=your_groq_api_key
# SECRET_KEY=your_jwt_secret_key

# Populate database with sample data
python testing/comprehensive_sample_data.py

# Initialize vector search index
python init_vectors.py

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will run at**: `http://localhost:8000`  
**API Documentation**: `http://localhost:8000/docs`

### Frontend Setup

```bash
# Navigate to SmartDine directory
cd SmartDine

# Install Node.js dependencies
npm install

# Create .env file with:
# API_BASE_URL=http://10.0.2.2:8000  # For Android emulator
# API_BASE_URL=http://YOUR_LOCAL_IP:8000  # For physical device
# GOOGLE_MAPS_API_KEY=your_google_maps_key

# Start Metro bundler
npx react-native start --reset-cache

# In a new terminal, run on Android
npx react-native run-android
```

---

## API Endpoints Reference

### Authentication Routes
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/signup` | POST | Register new user account | No |
| `/auth/login` | POST | Login and receive JWT token | No |
| `/auth/me` | GET | Get current authenticated user | Yes |

### Food Routes
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/foods` | GET | List all foods with filters | No |
| `/foods/{food_id}` | GET | Get specific food details | No |

### Restaurant Routes
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/restaurants` | GET | List all restaurants with menus | No |
| `/restaurants/{restaurant_id}` | GET | Get specific restaurant | No |

### Profile Routes
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/profile` | GET | Get user profile | Yes |
| `/profile` | PUT | Update user profile | Yes |
| `/profile/history` | GET | Get search history | Yes |

### AI Routes
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/ai/ask` | POST | Get AI-powered food recommendations | Optional |

### Health Check
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | Server health status | No |

---

## Key Features

**AI-Powered Recommendations**: Natural language processing using Groq AI (Llama 3.1) with vector search for intelligent food suggestions based on mood, dietary needs, and preferences.

**Smart Filtering**: Advanced search with filters for dietary restrictions (vegan, gluten-free, keto), price ranges, and nutritional values (protein, calories, fiber).

**Restaurant Integration**: Google Maps integration for location-based restaurant discovery and navigation.

**Nutritional Tracking**: Comprehensive nutritional information for every food item including macros and dietary tags.

**User Profiles**: Personalized experience with saved preferences, dietary restrictions, and search history.

**Dark Mode Support**: Complete theme system with smooth transitions between light and dark modes.

**Cart Management**: Global cart state management for seamless ordering experience.

**Notifications**: Centralized notification system for all app messages and updates.

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Mobile Framework** | React Native 0.73 | Cross-platform mobile app |
| **Language** | TypeScript | Type-safe frontend code |
| **Navigation** | React Navigation | Screen routing and navigation |
| **State Management** | React Context API | Global state (Auth, Theme, Cart) |
| **Backend Framework** | FastAPI | High-performance Python API |
| **Database** | MongoDB Atlas | Cloud-hosted NoSQL database |
| **Vector Search** | FAISS | Fast similarity search engine |
| **AI Engine** | Groq API (Llama 3.1) | Natural language processing |
| **Maps** | Google Maps Platform | Location and navigation |
| **Authentication** | JWT Tokens | Secure user authentication |
| **Password Hashing** | bcrypt | Secure password storage |

---

## Development Workflow

### Adding New Features

1. **Backend Changes**
   - Define data models in `models.py`
   - Create router in `routers/`
   - Implement business logic
   - Test via Swagger UI

2. **Frontend Changes**
   - Create TypeScript types in `src/types/`
   - Add service functions in `src/services/`
   - Build UI components
   - Integrate with navigation

3. **Testing**
   - Test API endpoints with Postman or Swagger
   - Test mobile app on emulator and physical device
   - Verify both light and dark themes

### Deployment Checklist

- [ ] Update environment variables for production
- [ ] Build optimized Android APK
- [ ] Configure production MongoDB cluster
- [ ] Set up backend hosting (e.g., Render, Railway, AWS)
- [ ] Update API_BASE_URL in mobile app
- [ ] Enable HTTPS for API endpoints
- [ ] Configure CORS for production domain

---

## Troubleshooting

**Metro Bundler Issues**: Clear cache with `npx react-native start --reset-cache`

**Android Build Errors**: Clean build with `cd android && ./gradlew clean && cd ..`

**Backend Connection**: Verify `API_BASE_URL` uses correct IP (not localhost for physical devices)

**FAISS Index Missing**: Run `python init_vectors.py` to rebuild vector index

**MongoDB Connection**: Check network access settings in MongoDB Atlas dashboard

---

## Project Structure Details

### Frontend (SmartDine/src)
- **App.tsx**: Main application component with navigation setup (moved to src/)
- **screens/**: Main app screens organized by feature
  - **auth/**: Login and Signup screens
  - **main/**: Home, Search, Profile, Cart, Map, SurpriseMe
  - **details/**: FoodDetail and Restaurant detail views
  - **settings/**: Settings and Notifications screens
- **components/**: Reusable UI components organized into subfolders
  - **cards/**: FoodCard, RestaurantCard
  - **common/**: SearchBar, ProfileHeader, Skeleton, StyledAlert
  - **layout/**: Layout components
- **navigation/**: Navigation configuration and stack navigators
- **context/**: Global state providers (AuthContext, ThemeContext, CartContext, NotificationContext)
- **services/**: API integration layer for backend communication
- **hooks/**: Custom React hooks (ready for future custom hooks)
- **assets/**: Static resources
  - **images/**: Image files
  - **fonts/**: Custom fonts
- **styles/**: Global styles and theme definitions
- **constants/**: App-wide constants (colors, dimensions, API endpoints)
- **types/**: TypeScript interfaces and type definitions
- **utils/**: Utility functions and helpers

### Backend
- **routers/**: API endpoint handlers organized by feature
- **services/**: Business logic (vector search, FAISS index management)
- **testing/**: Sample data generation and test scripts
- **models.py**: Pydantic models for request/response validation
- **db.py**: MongoDB connection and database utilities
- **main.py**: FastAPI application initialization and middleware

---

## License

MIT License

---

**Built with React Native and FastAPI**
