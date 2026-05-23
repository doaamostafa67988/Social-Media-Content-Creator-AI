from app.utils.groq_client import llm
from app.utils.prompts import WRITER_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)

def writer_agent(outline: str, research: str, revision_notes: str = "") -> str:
    logger.info("Writer generating article draft")
    revision_block = ""
    if revision_notes and revision_notes != "Initial Draft.":
        revision_block = f"\n\nREVISION NOTES FROM REVIEWER (address all points):\n{revision_notes}"

    prompt = f"""{WRITER_PROMPT}{revision_block}

CONTENT OUTLINE:
{outline}

RESEARCH DATA:
{research}
"""
    response = llm.invoke(prompt)
    logger.info("Writer completed article")
    return response.content
