from fastapi import FastAPI
from app.api.restaurants import router as restaurants_router
from app.api.recommend import router as recommend_router

app = FastAPI(title="SmartDine Backend")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

app.include_router(restaurants_router)
app.include_router(recommend_router)