from langchain_groq import ChatGroq
from app.config import settings

llm = ChatGroq(
    groq_api_key=settings.GROQ_API_KEY,
    model_name="llama-3.3-70b-versatile",
    temperature=0.3
)