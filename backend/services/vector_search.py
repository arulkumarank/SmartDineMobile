"""
Vector Search Service using FAISS and Sentence Transformers
Provides semantic search for food and restaurant recommendations
"""
import os
import json
import numpy as np
from typing import List, Dict, Optional
from sentence_transformers import SentenceTransformer
import faiss

class VectorSearchService:
    def __init__(self):
        self.model = None
        self.index = None
        self.food_data = []
        self.restaurant_index = None
        self.restaurant_data = []
        self.index_path = "services/faiss_index"
        self.is_initialized = False
        
    def initialize(self, foods: List[Dict]):
        """Initialize the vector search with food data"""
        try:
            print("🔧 Initializing vector search...")
            
            # Load sentence transformer model
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            print(" Loaded embedding model")
            
            # Prepare food data
            self.food_data = foods
            
            # Create embeddings
            texts = []
            for food in foods:
                # Combine relevant fields for better semantic matching
                text = f"{food.get('name', '')} {food.get('cuisine', '')} {food.get('restaurant', '')} {food.get('description', '')}"
                texts.append(text.strip())
            
            print(f"🔍 Creating embeddings for {len(texts)} foods...")
            embeddings = self.model.encode(texts, show_progress_bar=False)
            
            # Build FAISS index
            dimension = embeddings.shape[1]
            self.index = faiss.IndexFlatL2(dimension)
            self.index.add(np.array(embeddings).astype('float32'))
            
            # Save index
            os.makedirs(self.index_path, exist_ok=True)
            faiss.write_index(self.index, f"{self.index_path}/foods.index")
            
            # Save food data
            with open(f"{self.index_path}/foods.json", 'w') as f:
                json.dump(self.food_data, f)
            
            self.is_initialized = True
            print(f"✅ Vector search initialized with {len(foods)} foods")
            
        except Exception as e:
            print(f"❌ Vector search initialization failed: {e}")
            self.is_initialized = False
            raise
    
    def initialize_restaurants(self, restaurants: List[Dict]):
        """Initialize restaurant embeddings"""
        try:
            if not self.model:
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
            
            self.restaurant_data = restaurants
            
            # Create rich text for each restaurant
            texts = []
            for r in restaurants:
                menu = r.get("menu", [])
                veg_count = sum(1 for item in menu if item.get("diet", "").lower() == "veg")
                veg_pct = int(veg_count / len(menu) * 100) if menu else 0
                
                # Rich text representation
                text = f"{r.get('name', '')} {r.get('cuisine', '')} restaurant "
                text += f"{'vegetarian vegan friendly' if veg_pct > 70 else ''} "
                text += f"{'non-vegetarian meat bbq' if veg_pct < 30 else ''} "
                text += f"rating {r.get('rating', 3)} "
                texts.append(text.strip())
            
            print(f"🔍 Creating embeddings for {len(texts)} restaurants...")
            embeddings = self.model.encode(texts, show_progress_bar=False)
            
            # Build FAISS index for restaurants
            dimension = embeddings.shape[1]
            self.restaurant_index = faiss.IndexFlatL2(dimension)
            self.restaurant_index.add(np.array(embeddings).astype('float32'))
            
            # Save
            faiss.write_index(self.restaurant_index, f"{self.index_path}/restaurants.index")
            with open(f"{self.index_path}/restaurants.json", 'w') as f:
                json.dump(self.restaurant_data, f)
            
            print(f"✅ Restaurant vector search initialized with {len(restaurants)} restaurants")
            
        except Exception as e:
            print(f"❌ Restaurant vector init failed: {e}")
    
    def load_index(self):
        """Load existing FAISS index"""
        try:
            if not os.path.exists(f"{self.index_path}/foods.index"):
                print("⚠️ FAISS index not found")
                return False
                
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            self.index = faiss.read_index(f"{self.index_path}/foods.index")
            
            with open(f"{self.index_path}/foods.json", 'r') as f:
                self.food_data = json.load(f)
            
            # Also load restaurants if available
            if os.path.exists(f"{self.index_path}/restaurants.index"):
                self.restaurant_index = faiss.read_index(f"{self.index_path}/restaurants.index")
                with open(f"{self.index_path}/restaurants.json", 'r') as f:
                    self.restaurant_data = json.load(f)
                print(f"✅ Loaded restaurant index with {len(self.restaurant_data)} restaurants")
            
            self.is_initialized = True
            print(f"✅ Loaded FAISS index with {len(self.food_data)} foods")
            return True
            
        except Exception as e:
            print(f"❌ Failed to load index: {e}")
            self.is_initialized = False
            return False
    
    def search(self, query: str, k: int = 5) -> List[Dict]:
        """Search for similar foods using vector similarity"""
        try:
            if not self.is_initialized:
                if not self.load_index():
                    raise Exception("Index not initialized")
            
            # Encode query
            query_vector = self.model.encode([query])
            
            # Search
            k = min(k, len(self.food_data))  # Don't ask for more than available
            distances, indices = self.index.search(
                np.array(query_vector).astype('float32'), 
                k
            )
            
            # Return matching foods
            results = []
            for idx in indices[0]:
                if idx < len(self.food_data):
                    results.append(self.food_data[idx])
            
            print(f"🔍 Vector search: found {len(results)} foods for '{query}'")
            return results
            
        except Exception as e:
            print(f"❌ Vector search failed: {e}")
            raise
    
    def search_restaurants(self, user_preferences: str, k: int = 10) -> List[Dict]:
        """Search for restaurants matching user preferences using vector similarity"""
        try:
            if not self.restaurant_index:
                if not self.load_index():
                    raise Exception("Restaurant index not initialized")
            
            if not self.restaurant_index:
                print("⚠️ No restaurant index available")
                return self.restaurant_data  # Return unsorted
            
            # Encode user preferences
            query_vector = self.model.encode([user_preferences])
            
            # Search all restaurants and get sorted order
            k = min(k, len(self.restaurant_data))
            distances, indices = self.restaurant_index.search(
                np.array(query_vector).astype('float32'),
                k
            )
            
            # Return sorted restaurants
            results = []
            for idx in indices[0]:
                if idx < len(self.restaurant_data):
                    results.append(self.restaurant_data[idx])
            
            print(f"🔍 Vector search: sorted {len(results)} restaurants for preferences")
            return results
            
        except Exception as e:
            print(f"❌ Restaurant vector search failed: {e}")
            return self.restaurant_data  # Fallback unsorted


# Global instance
vector_search = VectorSearchService()


def search_foods(query: str, k: int = 5) -> str:
    """
    Search for foods using semantic similarity
    Returns formatted string for GROQ API
    """
    try:
        foods = vector_search.search(query, k)
        
        # Format for GROQ API
        formatted = []
        for food in foods:
            formatted.append(f"""
Name: {food.get('name', 'N/A')}
Restaurant: {food.get('restaurant', 'N/A')}
Cuisine: {food.get('cuisine', 'N/A')}
Price: ₹{food.get('price', 'N/A')}
Vegetarian: {food.get('is_vegetarian', False)}
Rating: {food.get('rating', 'N/A')}
""")
        
        return "\n---\n".join(formatted)
        
    except Exception as e:
        print(f"❌ search_foods error: {e}")
        raise


def search_restaurants_by_preference(dietary: List[str], tastes: List[str], cuisines: List[str]) -> List[Dict]:
    """
    Search restaurants using vector similarity with user preferences
    """
    try:
        # Build preference query string
        query_parts = []
        if "vegan" in [d.lower() for d in dietary]:
            query_parts.append("vegan vegetarian plant-based healthy")
        elif "vegetarian" in [d.lower() for d in dietary]:
            query_parts.append("vegetarian veg friendly")
        
        query_parts.extend(tastes)
        query_parts.extend(cuisines)
        
        preference_query = " ".join(query_parts) if query_parts else "popular restaurant"
        print(f"🔍 Restaurant preference query: {preference_query}")
        
        return vector_search.search_restaurants(preference_query)
        
    except Exception as e:
        print(f"❌ Restaurant preference search error: {e}")
        raise


def initialize_vector_search(foods: List[Dict]):
    """Initialize vector search with food data"""
    try:
        vector_search.initialize(foods)
        return True
    except Exception as e:
        print(f"❌ Could not initialize vector search: {e}")
        return False


def initialize_restaurant_search(restaurants: List[Dict]):
    """Initialize restaurant vector search"""
    try:
        vector_search.initialize_restaurants(restaurants)
        return True
    except Exception as e:
        print(f"❌ Could not initialize restaurant vector search: {e}")
        return False

