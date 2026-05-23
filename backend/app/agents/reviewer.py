import re
from app.utils.groq_client import llm
from app.utils.prompts import REVIEW_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)

def reviewer_agent(article: str) -> dict:
    logger.info("Reviewer evaluating article quality")
    prompt = f"""{REVIEW_PROMPT}

ARTICLE TO REVIEW:
{article}
"""
    response = llm.invoke(prompt)
    content = response.content

    # Robust score extraction — try Score: N or N/10 patterns
    score = 8  # safe default
    patterns = [
        r'Score:\s*(\d+(?:\.\d+)?)\s*(?:/\s*10)?',
        r'(\d+(?:\.\d+)?)\s*/\s*10',
        r'Rating:\s*(\d+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            try:
                score = int(float(match.group(1)))
                break
            except ValueError:
                pass

    logger.info(f"Reviewer assigned score: {score}/10")
    return {
        "review": content,
        "score": score
    }
