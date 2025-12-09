from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth import router as auth_router
from routers.restaurants import router as restaurant_router
from routers.ai import router as ai_router

app = FastAPI(title="SmartDine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
)

app.include_router(auth_router)
app.include_router(restaurant_router)
app.include_router(ai_router)

@app.get("/health")
def health():
    return {"status": "ok"}
