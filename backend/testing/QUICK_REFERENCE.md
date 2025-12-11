# 🍽️ SmartDine Sample Data - Quick Reference

## 📊 Database Overview
- ✅ **8 Restaurants** across diverse cuisines
- ✅ **38+ Menu Items** with full nutritional data
- ✅ **Price Range:** ₹80 - ₹550
- ✅ **3 Sample User Profiles**

---

## 🏪 Restaurants at a Glance

| # | Restaurant | Cuisine | Items | Rating | Price Range |
|---|-----------|---------|-------|--------|-------------|
| 1 | Spice Symphony | North Indian | 5 | ⭐4.7 | ₹220-₹350 |
| 2 | The Fitness Kitchen | Healthy | 5 | ⭐4.8 | ₹290-₹450 |
| 3 | Dosa Corner | South Indian | 5 | ⭐4.5 | ₹80-₹120 |
| 4 | Pizza Paradise | Italian | 5 | ⭐4.4 | ₹340-₹450 |
| 5 | The Burger Hub | American | 5 | ⭐4.3 | ₹180-₹350 |
| 6 | Sushi Station | Japanese | 4 | ⭐4.6 | ₹320-₹550 |
| 7 | Taco Fiesta | Mexican | 4 | ⭐4.4 | ₹180-₹340 |
| 8 | The Chinese Wok | Chinese | 5 | ⭐4.5 | ₹160-₹280 |

---

## 🏷️ Key Features

### Dietary Options
- 🥗 **Vegetarian:** 20+ items
- 🌱 **Vegan:** 8+ items  
- 💪 **High Protein (≥20g):** 15+ items
- 🌾 **High Fiber (≥5g):** 14+ items
- 🌾 **Gluten-Free:** 8+ items

### Spice Levels
- 😊 **Mild:** 18+ items
- 🌶️ **Medium:** 12+ items
- 🔥 **Hot:** 8+ items

---

## 🎯 Perfect Test Queries

### For Health Conscious Users
```
✅ "I want high protein food"
✅ "Show me healthy low calorie meals"
✅ "High fiber vegetarian options"
```

### For Food Explorers
```
✅ "Something spicy and Indian"
✅ "Traditional South Indian breakfast"
✅ "I'm feeling adventurous"
```

### For Budget Conscious
```
✅ "Vegetarian options under ₹200"
✅ "Cheap and filling food"
```

### For Dietary Restrictions
```
✅ "Gluten-free high protein meals"
✅ "Vegan food"
✅ "Low carb options"
```

---

## 🚀 Quick Start

### 1️⃣ Populate Database
```bash
cd d:\DeltaForge\backend
python testing\comprehensive_sample_data.py
```

### 2️⃣ Verify Data
```bash
python testing\verify_data.py
```

### 3️⃣ Start Backend
```bash
python -m uvicorn main:app --reload
```

### 4️⃣ Test API
```bash
curl http://localhost:8000/foods
```

---

## 💡 Featured Items

### 💪 Highest Protein
1. **Grilled Chicken Protein Bowl** - 45g (₹380)
2. **Salmon Sashimi** - 42g (₹550)
3. **Greek Salad with Grilled Chicken** - 35g (₹320)

### 🌾 Highest Fiber
1. **Quinoa Buddha Bowl** - 12g (₹340)
2. **Veggie Burrito Bowl** - 12g (₹320)
3. **Dal Makhani** - 9g (₹220)

### 💰 Best Value (Under ₹150)
1. **Idli Sambar** - ₹90
2. **Pongal** - ₹95
3. **Rava Dosa** - ₹110
4. **Masala Dosa** - ₹120

### 🔥 Spiciest Options
1. **Chicken Biryani** (Hot, ₹350)
2. **Chilli Chicken** (Hot, ₹280)
3. **Manchurian** (Hot, ₹220)

---

## 📍 All Locations (Chennai)

All restaurants are located across Chennai:
- Gopalapuram
- Neelankarai
- Alwarpet
- Thoraipakkam
- Palavakkam
- Nungambakkam
- Velachery
- Anna Nagar West

---

## 🔗 Useful URLs

- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Foods Endpoint:** http://localhost:8000/foods
- **Restaurants:** http://localhost:8000/restaurants
- **AI Ask:** http://localhost:8000/ai/ask

---

## ✅ Data Status

```
✅ Restaurants populated with menus
✅ All items have nutritional data
✅ Dietary tags configured
✅ Location data included
✅ Sample users created
✅ Ready for AI recommendations
```

---

**Need detailed info?** See [`SAMPLE_DATA_DOCUMENTATION.md`](./SAMPLE_DATA_DOCUMENTATION.md)
