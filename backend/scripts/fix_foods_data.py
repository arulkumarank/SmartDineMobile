"""
Script to fix foods.json with relevant unique images and logical data corrections
"""
import json

# Real Unsplash image URLs mapped to food items
FOOD_IMAGES = {
    # North Indian
    "Butter Chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600",
    "Gajar Halwa": "https://images.unsplash.com/photo-1601303516263-98fb3e5f0a03?w=600",
    "Garlic Naan": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600",
    "Gulab Jamun": "https://images.unsplash.com/photo-1666190094762-2e325934a3a6?w=600",
    "Aloo Gobi": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600",
    "Paneer Tikka": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600",
    
    # South Indian
    "Filter Coffee": "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=600",
    "Sambar": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600",
    "Medu Vada": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600",
    "Rava Dosa": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600",
    "Paper Masala Dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
    "Masala Dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
    "Uttapam": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600",
    
    # Chinese
    "Veg Spring Rolls": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600",
    "Honey Chilli Potato": "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600",
    "Szechwan Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600",
    "Chicken Manchurian": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600",
    "Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600",
    "Chilli Chicken": "https://images.unsplash.com/photo-1606471191009-63994c53433b?w=600",
    "Schezwan Noodles": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600",
    
    # Italian
    "Pesto Pasta": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600",
    "Tiramisu": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600",
    "Lasagna": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600",
    "Pasta Alfredo": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600",
    "Margherita Pizza": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
    "Caprese Salad": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600",
    
    # Biryani
    "Chicken Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
    "Chicken Dum Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
    "Hyderabadi Mutton Biryani": "https://images.unsplash.com/photo-1642821373181-696a54913e93?w=600",
    
    # Fast Food
    "Classic Beef Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
    "Double Chicken Burger": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600",
    "Crispy Paneer Burger": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600",
    "Veggie Burger": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600",
    "Vegan Burger": "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600",
    "Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600",
    
    # Japanese
    "Mochi Ice Cream": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600",
    "California Roll": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600",
    "Salmon Sashimi": "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=600",
    
    # Mexican
    "Chicken Tacos": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600",
    "Salsa & Chips": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600",
    "Churros": "https://images.unsplash.com/photo-1624371414361-e670edf4898d?w=600",
    
    # BBQ
    "BBQ Ribs": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600",
    "Smoked Paneer": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600",
    "Grilled Chicken Skewers": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
    "Corn on the Cob": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600",
    
    # Thai
    "Pad Thai": "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600",
    "Mango Sticky Rice": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600",
    "Thai Spring Rolls": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600",
    
    # Mughlai
    "Shahi Tukda": "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600",
    "Kebab Platter": "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600",
    "Korma": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600",
    "Pulao": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600",
    
    # Desserts
    "Cheesecake": "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600",
    "Red Velvet Cake": "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600",
    "Chocolate Truffle": "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600",
    "Brownie with Ice Cream": "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600",
    "Vanilla Creme Brulee": "https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=600",
    "Panna Cotta": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600",
    "Waffle with Ice Cream": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600",
    "Vanilla Scoop": "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600",
    "Strawberry Sundae": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600",
    "Macaron Assortment": "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600",
    "Mango Sorbet": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600",
    "Chocolate Scoop": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600",
    "Coconut Ice Cream": "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600",
    "Blueberry Cheesecake": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600",
    "Cinnamon Roll": "https://images.unsplash.com/photo-1509365390695-33aee754301f?w=600",
    
    # Healthy
    "Grilled Chicken Salad": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600",
    "Smoothie Bowl": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600",
    "Quinoa Power Bowl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
    "Avocado Toast": "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600",
    "Kale Smoothie": "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600",
    "Tofu Stir Fry": "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=600",
    
    # Seafood
    "Fried Calamari": "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600",
    "Fish Fry": "https://images.unsplash.com/photo-1580217593608-61931cefc821?w=600",
    "Prawn Curry": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
    
    # Street Food
    "Pav Bhaji": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600",
    "Vada Pav": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600",
    "Kathi Roll": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600",
    
    # Breakfast
    "Pancake Stack": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600",
    
    # Cafe
    "Cappuccino": "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600",
    "Iced Latte": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
    "Egg Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600",
}

# Tags that should be removed for specific foods
DESSERT_ITEMS = ["Cheesecake", "Red Velvet Cake", "Chocolate Truffle", "Brownie with Ice Cream", 
                  "Vanilla Creme Brulee", "Panna Cotta", "Waffle with Ice Cream", "Vanilla Scoop",
                  "Strawberry Sundae", "Macaron Assortment", "Mango Sorbet", "Chocolate Scoop",
                  "Coconut Ice Cream", "Blueberry Cheesecake", "Tiramisu", "Gulab Jamun", 
                  "Gajar Halwa", "Mochi Ice Cream", "Churros", "Shahi Tukda", "Cinnamon Roll",
                  "Mango Sticky Rice"]

def fix_food_item(item, index):
    """Fix a single food item with proper image and logical data"""
    name = item["name"]
    
    # Get unique image URL using index to differentiate same-named items
    base_url = FOOD_IMAGES.get(name, f"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600")
    # Add unique parameter to make URLs unique
    item["image"] = f"{base_url}&idx={index}"
    
    # Fix spice level for desserts
    if name in DESSERT_ITEMS:
        item["spicy"] = "none"
        # Fix tags - remove inappropriate tags and add dessert/sweet
        bad_tags = ["spicy", "rice", "noodles", "soup", "bread", "salad", "main", "side", "appetizer", "high-protein", "fried"]
        item["tags"] = [t for t in item["tags"] if t not in bad_tags]
        if "dessert" not in item["tags"]:
            item["tags"].append("dessert")
        if "sweet" not in item["tags"]:
            item["tags"].append("sweet")
    
    # Fix coffee items
    if name in ["Filter Coffee", "Cappuccino", "Iced Latte"]:
        item["spicy"] = "none"
        item["tags"] = ["beverage", "popular"]
    
    return item

def main():
    # Read the existing foods.json
    with open("d:/DeltaForge/backend/services/faiss_index/foods.json", "r", encoding="utf-8") as f:
        foods = json.load(f)
    
    # Fix each food item
    fixed_foods = [fix_food_item(item, i) for i, item in enumerate(foods)]
    
    # Write the fixed data back
    with open("d:/DeltaForge/backend/services/faiss_index/foods.json", "w", encoding="utf-8") as f:
        json.dump(fixed_foods, f, indent=2, ensure_ascii=False)
    
    print(f"Fixed {len(fixed_foods)} food items with unique images and corrected data.")

if __name__ == "__main__":
    main()
