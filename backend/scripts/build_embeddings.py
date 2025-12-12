"""
Build FAISS Vector Embeddings from Restaurant Menu Items
Extracts all menu items from embedded structure and creates searchable index
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import collection as restaurants_collection

def extract_all_menu_items():
    """Extract all menu items from restaurants with metadata"""
    print("📊 Extracting menu items from restaurants...")
    
    all_items = []
    restaurants = list(restaurants_collection.find())
    
    for restaurant in restaurants:
        restaurant_name = restaurant.get('name', 'Unknown')
        cuisine = restaurant.get('cuisine', 'Unknown')
        
        for menu_item in restaurant.get('menu', []):
            # Create searchable item with restaurant context
            item = {
                'name': menu_item.get('name'),
                'restaurant': restaurant_name,
                'cuisine': cuisine,
                'price': menu_item.get('price'),
                'is_vegetarian': menu_item.get('is_vegetarian', False),
                'rating': menu_item.get('rating', 4.0),
                'spicy': menu_item.get('spicy', 'none'),
                'diet': menu_item.get('diet', 'veg'),
                'tags': menu_item.get('tags', []),
                'image': menu_item.get('image', ''),
                'nutritional_info': menu_item.get('nutritional_info', {})
            }
            all_items.append(item)
    
    print(f"✅ Extracted {len(all_items)} menu items from {len(restaurants)} restaurants")
    return all_items

def build_faiss_index():
    """Build FAISS index from menu items"""
    try:
        from services.vector_search import initialize_vector_search
        
        print("=" * 60)
        print("🚀 Building FAISS Vector Embeddings")
        print("=" * 60)
        
        # Extract items
        menu_items = extract_all_menu_items()
        
        # Build index
        print("\n🔧 Creating vector embeddings...")
        success = initialize_vector_search(menu_items)
        
        if success:
            print("\n" + "=" * 60)
            print("✅ FAISS Index Built Successfully!")
            print("=" * 60)
            print(f"\n📈 Stats:")
            print(f"  • Total items indexed: {len(menu_items)}")
            print(f"  • Location: services/faiss_index/")
            print(f"\n💡 Enable vector search: Set USE_VECTOR_SEARCH=true in .env")
        else:
            print("\n❌ Failed to build FAISS index")
            
    except ImportError as e:
        print(f"\n❌ Vector search dependencies not installed: {e}")
        print("   Run: pip install faiss-cpu sentence-transformers")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    build_faiss_index()
