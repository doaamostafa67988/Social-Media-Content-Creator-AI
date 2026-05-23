from app.utils.groq_client import llm
from app.utils.prompts import STRATEGIST_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)

def strategist_agent(topic: str, audience: str) -> str:
    logger.info(f"Strategist running for topic='{topic}', audience='{audience}'")
    prompt = f"""{STRATEGIST_PROMPT}

Topic: {topic}
Target Audience: {audience}
"""
    response = llm.invoke(prompt)
    logger.info("Strategist completed outline")
    return response.content
