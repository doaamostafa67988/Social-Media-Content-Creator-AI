"""
Publishing / Scheduler Agent
Determines optimal publish times and queues platform-specific jobs.
"""
import json
import re
from datetime import datetime, timedelta
from app.utils.groq_client import llm
from app.utils.prompts import SCHEDULER_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)

DEFAULT_SCHEDULE = {
    "twitter":   (timedelta(hours=1),),
    "linkedin":  (timedelta(hours=2),),
    "instagram": (timedelta(hours=3),),
}

def scheduler_agent(topic: str, social_content: str) -> dict:
    logger.info(f"Scheduler agent planning publish times for '{topic}'")
    prompt = f"""{SCHEDULER_PROMPT}

Topic: {topic}
Social Content Summary: {social_content[:500]}
Current UTC Time: {datetime.utcnow().isoformat()}
"""
    try:
        response = llm.invoke(prompt)
        raw = response.content

        # Strip markdown fences if present
        clean = re.sub(r"```(?:json)?|```", "", raw).strip()
        schedule_data = json.loads(clean)
        logger.info("Scheduler returned AI-driven schedule")
        return schedule_data
    except Exception as e:
        logger.warning(f"Scheduler LLM parse failed ({e}), using defaults")
        now = datetime.utcnow()
        return {
            "recommended_publish_time": (now + timedelta(hours=1)).isoformat(),
            "platform_schedule": {
                "twitter":   (now + timedelta(hours=1)).isoformat(),
                "linkedin":  (now + timedelta(hours=2)).isoformat(),
                "instagram": (now + timedelta(hours=3)).isoformat(),
            },
            "reasoning": "Default staggered schedule (LLM scheduling unavailable)."
        }
