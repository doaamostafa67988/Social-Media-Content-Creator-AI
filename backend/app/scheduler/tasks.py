from app.scheduler.celery_worker import celery
from app.graph.workflow import workflow
from app.db.database import SessionLocal
from app.db.models import BlogPost
from app.utils.logger import get_logger

logger = get_logger("celery_tasks")

@celery.task(bind=True, max_retries=2, default_retry_delay=30)
def run_autonomous_pipeline_task(self, db_record_id: int, topic: str, audience: str):
    logger.info(f"[TASK] Starting pipeline for record_id={db_record_id}")
    db = SessionLocal()

    try:
        # Mark as RUNNING
        post = db.query(BlogPost).filter(BlogPost.id == db_record_id).first()
        if post:
            post.status = "RUNNING"
            db.commit()

        output = workflow.invoke({
            "topic":       topic,
            "audience":    audience,
            "loop_count":  0,
            "source_count": 0,
        })

        post = db.query(BlogPost).filter(BlogPost.id == db_record_id).first()
        if post:
            post.title        = output.get("outline", "")[:200].split("\n")[0].lstrip("# ") or topic
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
            logger.info(f"[TASK] Pipeline COMPLETED for record_id={db_record_id}")

    except Exception as exc:
        logger.error(f"[TASK] Pipeline FAILED for record_id={db_record_id}: {exc}", exc_info=True)
        db.rollback()
        post = db.query(BlogPost).filter(BlogPost.id == db_record_id).first()
        if post:
            post.status    = "FAILED"
            post.error_msg = str(exc)
            db.commit()
        raise self.retry(exc=exc)
    finally:
        db.close()
