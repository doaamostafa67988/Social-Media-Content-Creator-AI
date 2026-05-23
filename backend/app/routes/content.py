from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from app.db.database import get_db
from app.db.models import BlogPost
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/content", tags=["content"])

# ── Schemas ───────────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    topic:    str = Field(..., min_length=3, max_length=200)
    audience: str = Field(..., min_length=3, max_length=200)

class BlogPostResponse(BaseModel):
    id:                 int
    topic:              str
    audience:           str
    status:             str
    title:              Optional[str] = None
    article:            Optional[str] = None
    seo:                Optional[str] = None
    social:             Optional[str] = None
    review:             Optional[str] = None
    schedule:           Optional[dict] = None
    review_score:       Optional[int] = None
    source_count:       Optional[int] = None
    loop_count:         Optional[int] = None
    error_msg:          Optional[str] = None
    twitter_published:  Optional[str] = None
    linkedin_published: Optional[str] = None
    created_at:         Optional[datetime] = None
    updated_at:         Optional[datetime] = None

    model_config = {"from_attributes": True}

class PublishRequest(BaseModel):
    platforms: List[str] = Field(..., description="e.g. ['twitter','linkedin']")

# ── Background runner (no Redis/Celery needed) ────────────────────────────────

def _run_pipeline_in_background(post_id: int, topic: str, audience: str):
    """Runs the full LangGraph pipeline in a background thread."""
    from app.db.database import SessionLocal
    from app.graph.workflow import workflow

    db = SessionLocal()
    try:
        post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
        if post:
            post.status = "RUNNING"
            db.commit()

        output = workflow.invoke({
            "topic":        topic,
            "audience":     audience,
            "loop_count":   0,
            "source_count": 0,
        })

        post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
        if post:
            raw_outline = output.get("outline", "")
            # Extract first non-empty line as title
            title_line = next(
                (l.lstrip("# ").strip() for l in raw_outline.splitlines() if l.strip()),
                topic
            )
            post.title        = title_line[:200]
            post.article      = output.get("article")
            post.seo          = output.get("seo")
            post.social       = output.get("social")
            post.review       = output.get("review")
            post.review_score = output.get("review_score")
            post.source_count = output.get("source_count", 0)
            post.loop_count   = output.get("loop_count", 0)
            post.schedule     = output.get("schedule")
            post.status       = "COMPLETED"
            db.commit()
            logger.info(f"Pipeline COMPLETED for post_id={post_id}")

    except Exception as exc:
        logger.error(f"Pipeline FAILED for post_id={post_id}: {exc}", exc_info=True)
        db.rollback()
        post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
        if post:
            post.status    = "FAILED"
            post.error_msg = str(exc)
            db.commit()
    finally:
        db.close()

# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/generate", status_code=status.HTTP_202_ACCEPTED, response_model=BlogPostResponse)
async def trigger_generation(
    payload: GenerateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Kick off the multi-agent pipeline in a background thread (no Redis required)."""
    post = BlogPost(topic=payload.topic, audience=payload.audience, status="PENDING")
    db.add(post)
    db.commit()
    db.refresh(post)

    # Use FastAPI BackgroundTasks — works on Windows with zero extra services
    background_tasks.add_task(
        _run_pipeline_in_background, post.id, payload.topic, payload.audience
    )
    logger.info(f"Pipeline dispatched (background thread) for post_id={post.id}")
    return post


@router.get("/status/{post_id}", response_model=BlogPostResponse)
async def get_status(post_id: int, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.get("/history", response_model=List[BlogPostResponse])
async def list_posts(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    posts = (
        db.query(BlogPost)
        .order_by(BlogPost.created_at.desc())
        .offset(skip).limit(limit)
        .all()
    )
    return posts


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()


@router.post("/{post_id}/publish", response_model=BlogPostResponse)
async def publish_post(post_id: int, req: PublishRequest, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.status != "COMPLETED":
        raise HTTPException(status_code=400, detail="Post must be COMPLETED before publishing")

    from app.integrations.twitter import publish_twitter_thread
    from app.integrations.linkedin import publish_linkedin_post

    if "twitter" in req.platforms:
        result = publish_twitter_thread(post.social or "", post.id)
        post.twitter_published = result.get("status", "failed")

    if "linkedin" in req.platforms:
        result = publish_linkedin_post(post.social or "", post.id)
        post.linkedin_published = result.get("status", "failed")

    db.commit()
    db.refresh(post)
    return post