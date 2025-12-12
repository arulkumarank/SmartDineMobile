# Scripts Directory

Single comprehensive script for database seeding and maintenance.

## seed_database.py

All-in-one script for SmartDine database operations.

### Usage

**Seed Database** (add 20 restaurants + 78 food items):
```bash
python scripts/seed_database.py --seed
```

**Rebuild FAISS Index**:
```bash
python scripts/seed_database.py --rebuild-index
```

### What It Does

- **--seed**: Adds 20 diverse restaurants with 60+ food items, plus fills missing menus
- **--rebuild-index**: Rebuilds FAISS vector search index from current database
- Auto-rebuilds index after seeding
- Skips duplicates automatically
- Shows database status after completion

### Database Contents After Seeding

- **28 Total Restaurants** (8 original + 20 new)
- **84 Total Food Items**:
  - 6 original foods
  - 60 new restaurant foods  
  - 18 missing menu items
- **15+ Cuisines**: Healthy, North/South Indian, Chinese, Italian, Japanese, Mexican, Thai, BBQ, Vegan, Seafood, Street Food, Breakfast, Cafe, etc.
