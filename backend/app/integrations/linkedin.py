"""
LinkedIn API Integration
Publishes posts using LinkedIn API v2.
Requires: pip install requests
"""
import re
import requests
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

def _parse_linkedin_post(social_content: str) -> str:
    """Extract the LinkedIn post section."""
    match = re.search(
        r"---\s*LINKEDIN POST\s*---\s*(.*?)(?=---|\Z)",
        social_content, re.DOTALL | re.IGNORECASE
    )
    if match:
        return match.group(1).strip()
    # Fallback: first 700 chars
    return social_content[:700]

def publish_linkedin_post(social_content: str, post_id: int) -> dict:
    """
    Publish to LinkedIn using the UGC Posts API.
    Requires LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_URN in .env
    """
    if not settings.LINKEDIN_ACCESS_TOKEN or not settings.LINKEDIN_PERSON_URN:
        logger.warning("LinkedIn credentials not configured — skipping publish")
        return {"status": "skipped", "reason": "credentials_missing"}

    text = _parse_linkedin_post(social_content)
    payload = {
        "author": f"urn:li:person:{settings.LINKEDIN_PERSON_URN}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE",
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }
    headers = {
        "Authorization": f"Bearer {settings.LINKEDIN_ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
    }
    try:
        resp = requests.post(
            "https://api.linkedin.com/v2/ugcPosts",
            json=payload, headers=headers, timeout=10
        )
        resp.raise_for_status()
        urn = resp.headers.get("X-RestLi-Id", "unknown")
        logger.info(f"LinkedIn post published for post {post_id}: {urn}")
        return {"status": "published", "urn": urn}
    except Exception as e:
        logger.error(f"LinkedIn publish failed: {e}")
        return {"status": "failed", "error": str(e)}
