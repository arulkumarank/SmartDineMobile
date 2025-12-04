from fastapi import APIRouter
from app.models.recommend import RecommendRequest, RecommendResponse
from app.services.recommend_service import (
recommend_rule_based,
simple_parse_intent,
)

router = APIRouter(prefix="/api/recommend", tags=["recommend"])

@router.post("", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    intent = simple_parse_intent(request)
    recommendations = await recommend_rule_based(request)
    return RecommendResponse(
    restaurants=recommendations,
    parsed_intent=intent,
)