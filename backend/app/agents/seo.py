from app.utils.groq_client import llm
from app.utils.prompts import SEO_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)

def seo_agent(article: str) -> str:
    logger.info("SEO agent optimizing article")
    prompt = f"""{SEO_PROMPT}

ARTICLE:
{article}
"""
    response = llm.invoke(prompt)
    logger.info("SEO optimization complete")
    return response.content
