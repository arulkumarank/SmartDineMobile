from fastapi import APIRouter, HTTPException
from models import Question
from db import responses_collection
from utils.groq import generate_ai_response

router = APIRouter()

@router.post("/ask")
def ask(data: Question):
    answer = generate_ai_response(data.question)
    responses_collection.insert_one({"q": data.question, "a": answer})
    return {"answer": answer}
