from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import restaurants, ai, auth, profile, foods, feedback

app = FastAPI(title="SmartDine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(restaurants.router)
app.include_router(foods.router)
app.include_router(ai.router)
app.include_router(feedback.router)


@app.get("/")
def root():
    return {"message": "Welcome to SmartDine API"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "SmartDine API"}
