from app.utils.groq_client import llm
from app.utils.prompts import SOCIAL_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)

def social_agent(article: str) -> str:
    logger.info("Social agent generating platform content")
    prompt = f"""{SOCIAL_PROMPT}

ARTICLE:
{article}
"""
    response = llm.invoke(prompt)
    logger.info("Social content generation complete")
    return response.content
