"""
Twitter/X API Integration
Publishes tweets using Twitter API v2 via tweepy.
Requires: pip install tweepy
"""
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

def _parse_twitter_thread(social_content: str) -> list[str]:
    """Extract tweet lines from the TWITTER/X THREAD section."""
    tweets = []
    in_section = False
    for line in social_content.splitlines():
        stripped = line.strip()
        if "TWITTER/X THREAD" in stripped.upper() or "TWITTER THREAD" in stripped.upper():
            in_section = True
            continue
        if in_section and stripped.startswith("---"):
            break
        if in_section and stripped.startswith("Tweet"):
            text = stripped.split(":", 1)[-1].strip()
            if text:
                tweets.append(text[:280])
    return tweets or [social_content[:280]]

def publish_twitter_thread(social_content: str, post_id: int) -> dict:
    """
    Publish a Twitter thread. Requires tweepy and valid Twitter API v2 credentials.
    Returns status dict.
    """
    if not all([
        settings.TWITTER_API_KEY,
        settings.TWITTER_API_SECRET,
        settings.TWITTER_ACCESS_TOKEN,
        settings.TWITTER_ACCESS_SECRET,
    ]):
        logger.warning("Twitter credentials not configured — skipping publish")
        return {"status": "skipped", "reason": "credentials_missing"}

    try:
        import tweepy
        client = tweepy.Client(
            consumer_key=settings.TWITTER_API_KEY,
            consumer_secret=settings.TWITTER_API_SECRET,
            access_token=settings.TWITTER_ACCESS_TOKEN,
            access_token_secret=settings.TWITTER_ACCESS_SECRET,
        )
        tweets = _parse_twitter_thread(social_content)
        tweet_ids = []
        reply_to = None

        for tweet_text in tweets:
            kwargs = {"text": tweet_text}
            if reply_to:
                kwargs["in_reply_to_tweet_id"] = reply_to
            resp = client.create_tweet(**kwargs)
            reply_to = resp.data["id"]
            tweet_ids.append(reply_to)

        logger.info(f"Published Twitter thread ({len(tweet_ids)} tweets) for post {post_id}")
        return {"status": "published", "tweet_ids": tweet_ids}
    except Exception as e:
        logger.error(f"Twitter publish failed: {e}")
        return {"status": "failed", "error": str(e)}
