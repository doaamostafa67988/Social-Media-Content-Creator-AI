from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from app.db.database import Base

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id          = Column(Integer, primary_key=True, index=True)
    topic       = Column(String(255), nullable=False, index=True)
    audience    = Column(String(255), nullable=False)

    # Pipeline outputs
    title       = Column(String(500), nullable=True)
    article     = Column(Text, nullable=True)
    seo         = Column(Text, nullable=True)
    social      = Column(Text, nullable=True)
    review      = Column(Text, nullable=True)
    schedule    = Column(JSON, nullable=True)   # scheduler agent output

    # Quality metrics
    review_score = Column(Integer, nullable=True)
    source_count = Column(Integer, default=0)
    loop_count   = Column(Integer, default=0)

    # State machine
    # Values: PENDING | RUNNING | COMPLETED | FAILED
    status      = Column(String(50), default="PENDING", nullable=False, index=True)
    error_msg   = Column(Text, nullable=True)

    # Publishing state per platform
    twitter_published   = Column(String(50), default="pending")
    linkedin_published  = Column(String(50), default="pending")

    created_at  = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id":                 self.id,
            "topic":              self.topic,
            "audience":           self.audience,
            "title":              self.title,
            "article":            self.article,
            "seo":                self.seo,
            "social":             self.social,
            "review":             self.review,
            "schedule":           self.schedule,
            "review_score":       self.review_score,
            "source_count":       self.source_count,
            "loop_count":         self.loop_count,
            "status":             self.status,
            "error_msg":          self.error_msg,
            "twitter_published":  self.twitter_published,
            "linkedin_published": self.linkedin_published,
            "created_at":         self.created_at.isoformat() if self.created_at else None,
            "updated_at":         self.updated_at.isoformat() if self.updated_at else None,
        }
