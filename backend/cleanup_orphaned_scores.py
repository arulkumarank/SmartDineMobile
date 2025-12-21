"""
Cleanup script for orphaned food scores
Removes scores for foods that no longer exist in restaurant menus

Run this periodically (e.g., monthly) via cron or scheduler:
    python cleanup_orphaned_scores.py
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import collection as restaurants_collection, food_scores
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def cleanup_orphaned_food_scores():
    """Remove scores for foods that no longer exist in any restaurant menu"""
    
    logger.info("🧹 Starting orphaned food scores cleanup...")
    
    try:
        # Get all current food names from restaurant menus
        logger.info("📋 Loading current food items from menus...")
        current_foods = set()
        restaurant_count = 0
        
        for restaurant in restaurants_collection.find():
            restaurant_count += 1
            for item in restaurant.get("menu", []):
                food_name = item.get("name")
                if food_name:
                    current_foods.add(food_name)
        
        logger.info(f"✅ Found {len(current_foods)} unique foods across {restaurant_count} restaurants")
        
        # Get all food scores
        logger.info("🔍 Checking food scores for orphaned entries...")
        all_scores = list(food_scores.find({}, {"food_name": 1}))
        logger.info(f"📊 Total food scores in database: {len(all_scores)}")
        
        # Find and delete orphaned scores
        deleted_count = 0
        orphaned_foods = []
        
        for score in all_scores:
            food_name = score.get("food_name")
            if food_name and food_name not in current_foods:
                orphaned_foods.append(food_name)
                food_scores.delete_one({"_id": score["_id"]})
                deleted_count += 1
                logger.info(f"  🗑️  Deleted orphaned score for: {food_name}")
        
        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("📊 Cleanup Summary:")
        logger.info(f"  • Active foods: {len(current_foods)}")
        logger.info(f"  • Total scores before: {len(all_scores)}")
        logger.info(f"  • Orphaned scores deleted: {deleted_count}")
        logger.info(f"  • Remaining scores: {len(all_scores) - deleted_count}")
        logger.info("=" * 60)
        
        if deleted_count > 0:
            logger.info(f"\n✅ Successfully cleaned up {deleted_count} orphaned food scores!")
        else:
            logger.info("\n✅ No orphaned scores found - database is clean!")
        
        return deleted_count
        
    except Exception as e:
        logger.error(f"❌ Error during cleanup: {e}")
        raise


def get_cleanup_stats():
    """Get statistics about potential cleanup"""
    
    logger.info("📊 Analyzing database for cleanup potential...")
    
    try:
        # Current foods
        current_foods = set()
        for restaurant in restaurants_collection.find():
            for item in restaurant.get("menu", []):
                food_name = item.get("name")
                if food_name:
                    current_foods.add(food_name)
        
        # All scores
        all_scores = list(food_scores.find({}, {"food_name": 1}))
        
        # Orphaned count
        orphaned = sum(1 for score in all_scores 
                      if score.get("food_name") not in current_foods)
        
        stats = {
            "active_foods": len(current_foods),
            "total_scores": len(all_scores),
            "orphaned_scores": orphaned,
            "cleanup_percentage": (orphaned / len(all_scores) * 100) if all_scores else 0
        }
        
        logger.info("\n📊 Cleanup Statistics:")
        logger.info(f"  • Active foods: {stats['active_foods']}")
        logger.info(f"  • Total scores: {stats['total_scores']}")
        logger.info(f"  • Orphaned scores: {stats['orphaned_scores']}")
        logger.info(f"  • Potential cleanup: {stats['cleanup_percentage']:.1f}%")
        
        return stats
        
    except Exception as e:
        logger.error(f"❌ Error getting stats: {e}")
        raise


if __name__ == "__main__":
    print("=" * 60)
    print("Orphaned Food Scores Cleanup")
    print("=" * 60)
    print()
    
    # Show stats first
    stats = get_cleanup_stats()
    
    # Ask for confirmation if orphaned scores exist
    if stats['orphaned_scores'] > 0:
        print()
        response = input(f"Delete {stats['orphaned_scores']} orphaned scores? (y/n): ")
        if response.lower() == 'y':
            deleted = cleanup_orphaned_food_scores()
            print(f"\n✅ Cleanup complete! Deleted {deleted} orphaned scores.")
        else:
            print("\n❌ Cleanup cancelled.")
    else:
        print("\n✅ No cleanup needed - database is already clean!")
