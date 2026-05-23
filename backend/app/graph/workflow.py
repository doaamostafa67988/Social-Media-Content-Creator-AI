"""
LangGraph Multi-Agent Workflow
Implements the full 7-agent pipeline with reflection loop and scheduler.
"""
from typing import TypedDict, Optional, Dict, Any
from langgraph.graph import StateGraph, END
import re

from app.agents.strategist import strategist_agent
from app.agents.researcher import research_agent
from app.agents.writer import writer_agent
from app.agents.seo import seo_agent
from app.agents.social import social_agent
from app.agents.reviewer import reviewer_agent
from app.agents.scheduler_agent import scheduler_agent
from app.utils.logger import get_logger

logger = get_logger(__name__)

MAX_REVISION_LOOPS = 2

class GraphState(TypedDict):
    # Inputs
    topic: str
    audience: str
    # Agent outputs
    outline: str
    research: str
    article: str
    seo: str
    social: str
    review: str
    review_score: int
    revision_notes: str
    schedule: dict
    # Control
    loop_count: int
    source_count: int

# ── Node functions ────────────────────────────────────────────────────────────

def strategist_node(state: GraphState) -> Dict[str, Any]:
    logger.info("[NODE] strategist")
    outline = strategist_agent(state["topic"], state["audience"])
    return {"outline": outline, "loop_count": state.get("loop_count", 0)}

def research_node(state: GraphState) -> Dict[str, Any]:
    logger.info("[NODE] researcher")
    result = research_agent(state["topic"])
    return {
        "research": result["summary"],
        "source_count": result.get("source_count", 0)
    }

def writer_node(state: GraphState) -> Dict[str, Any]:
    logger.info("[NODE] writer")
    notes = state.get("revision_notes", "Initial Draft.")
    article = writer_agent(
        outline=state["outline"],
        research=state["research"],
        revision_notes=notes
    )
    return {
        "article": article,
        "loop_count": state.get("loop_count", 0) + 1
    }

def reviewer_node(state: GraphState) -> Dict[str, Any]:
    logger.info("[NODE] reviewer")
    result = reviewer_agent(state["article"])
    return {
        "review": result["review"],
        "review_score": result["score"],
        "revision_notes": result["review"],
    }

def seo_node(state: GraphState) -> Dict[str, Any]:
    logger.info("[NODE] seo")
    seo = seo_agent(state["article"])
    return {"seo": seo}

def social_node(state: GraphState) -> Dict[str, Any]:
    logger.info("[NODE] social")
    social = social_agent(state["article"])
    return {"social": social}

def scheduler_node(state: GraphState) -> Dict[str, Any]:
    logger.info("[NODE] scheduler")
    schedule = scheduler_agent(state["topic"], state.get("social", ""))
    return {"schedule": schedule}

# ── Routing ───────────────────────────────────────────────────────────────────

def route_after_review(state: GraphState) -> str:
    loop = state.get("loop_count", 0)
    score = state.get("review_score", 10)

    if loop >= MAX_REVISION_LOOPS:
        logger.info(f"[ROUTE] Circuit breaker hit (loop={loop}). Proceeding to SEO.")
        return "proceed"
    if score < 7:
        logger.info(f"[ROUTE] Score {score} < 7. Sending back to writer.")
        return "rewrite"
    logger.info(f"[ROUTE] Score {score} >= 7. Proceeding to SEO.")
    return "proceed"

# ── Build Graph ───────────────────────────────────────────────────────────────

workflow_builder = StateGraph(GraphState)

workflow_builder.add_node("strategist", strategist_node)
workflow_builder.add_node("researcher", research_node)
workflow_builder.add_node("writer",     writer_node)
workflow_builder.add_node("reviewer",   reviewer_node)
workflow_builder.add_node("seo",        seo_node)
workflow_builder.add_node("social",     social_node)
workflow_builder.add_node("scheduler",  scheduler_node)

workflow_builder.set_entry_point("strategist")

workflow_builder.add_edge("strategist", "researcher")
workflow_builder.add_edge("researcher", "writer")
workflow_builder.add_edge("writer",     "reviewer")

workflow_builder.add_conditional_edges(
    "reviewer",
    route_after_review,
    {
        "rewrite": "writer",
        "proceed": "seo",
    }
)

workflow_builder.add_edge("seo",       "social")
workflow_builder.add_edge("social",    "scheduler")
workflow_builder.add_edge("scheduler", END)

workflow = workflow_builder.compile()
