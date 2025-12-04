from typing import List
import re

from app.db.restaurants import list_restaurants
from app.models.recommend import (
    RecommendRequest,
    ParsedIntent,
    RestaurantRecommendation,
)
from app.models.restaurant import RestaurantOut

KNOWN_FOOD_TAGS = [
    "cheesy",
    "lite",
    "spicy",
    "sweet",
    "healthy",
    "protein-rich",
    "high-protein",
]

KNOWN_MOODS = [
    "comfort",
    "celebration",
    "study",
    "chill",
    "date",
    "family",
]

def simple_parse_intent(request: RecommendRequest) -> ParsedIntent:
    text = request.query.lower()

    # Very simple number detection for budget
    budget_max = None
    numbers = re.findall(r"\d+", text)
    if numbers:
        budget_max = int(numbers[0])

    # Detect city from text if present; fallback to request.city
    city = request.city
    if "coimbatore" in text:
        city = "Coimbatore"

    # Detect food tags
    food_tags: List[str] = []
    for tag in KNOWN_FOOD_TAGS:
        if tag in text:
            food_tags.append(tag)
    # Map “high protein” to “protein-rich”
    if "high protein" in text and "protein-rich" not in food_tags:
        food_tags.append("protein-rich")

    # Detect moods (very simple keyword matching)
    mood = None
    if "after exam" in text or "tired" in text or "rough day" in text:
        mood = "comfort"
    elif "celebrate" in text or "party" in text:
        mood = "celebration"
    elif "study" in text or "work" in text or "focus" in text:
        mood = "study"

    # Detect cuisine hints
    cuisine_hints: List[str] = []
    for cuisine in ["italian", "north indian", "chinese", "cafe", "mexican"]:
        if cuisine in text:
            cuisine_hints.append(cuisine)

    return ParsedIntent(
        mood=mood,
        cuisine_hints=cuisine_hints,
        budget_max=budget_max,
        food_tags=food_tags,
        city=city,
    )


def compute_score(restaurant: RestaurantOut, intent: ParsedIntent) -> float:
    score = 0.0

    # Base: rating
    if restaurant.rating_avg is not None:
        score += restaurant.rating_avg / 5.0 * 0.5  # up to 0.5

    # Food tag match
    if intent.food_tags and restaurant.food_tags:
        overlap = set(intent.food_tags) & set(restaurant.food_tags)
        if overlap:
            score += 0.3  # strong boost

    # Mood tag match
    if intent.mood and restaurant.mood_tags:
        if intent.mood in restaurant.mood_tags:
            score += 0.1

    # Cuisine hint
    if intent.cuisine_hints and restaurant.cuisine:
        for hint in intent.cuisine_hints:
            if hint.lower() in restaurant.cuisine.lower():
                score += 0.1
                break

    return score


def build_explanation(restaurant: RestaurantOut, intent: ParsedIntent) -> str:
    parts: List[str] = []

    if intent.food_tags:
        parts.append(f"Matches your request for {', '.join(intent.food_tags)} food")

    if intent.budget_max and restaurant.avg_price:
        parts.append(f"within your budget around ₹{intent.budget_max}")

    if restaurant.rating_avg:
        parts.append(f"with a {restaurant.rating_avg:.1f}★ rating")

    if restaurant.city:
        parts.append(f"in {restaurant.city}")

    if not parts:
        return f"Recommended based on your query and this restaurant’s rating and tags."

    return " ".join(parts) + "."


async def recommend_rule_based(request: RecommendRequest) -> List[RestaurantRecommendation]:
    intent = simple_parse_intent(request)

    # For MVP, use existing list_restaurants with city and first food_tag (if any)
    first_tag = intent.food_tags[0] if intent.food_tags else None

    base_restaurants: List[RestaurantOut] = await list_restaurants(
        limit=50,
        city=intent.city,
        cuisine=None,
        mood=intent.mood,
        food_tag=first_tag,
    )

    recommendations: List[RestaurantRecommendation] = []

    for r in base_restaurants:
        score = compute_score(r, intent)
        if score <= 0:
            continue

        explanation = build_explanation(r, intent)

        recommendations.append(
            RestaurantRecommendation(
                id=r.id,
                name=r.name,
                cuisine=r.cuisine,
                avg_price=r.avg_price,
                city=r.city,
                rating_avg=r.rating_avg,
                mood_tags=r.mood_tags,
                food_tags=r.food_tags,
                score=score,
                explanation=explanation,
            )
        )

    recommendations.sort(key=lambda x: x.score, reverse=True)
    return recommendations[: request.limit]
