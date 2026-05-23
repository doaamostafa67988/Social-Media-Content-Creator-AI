from tavily import TavilyClient
from app.config import settings
from app.utils.groq_client import llm
from app.rag.vector_store import ingest_research_results, query_historical_context
from app.utils.logger import get_logger

logger = get_logger(__name__)
client = TavilyClient(api_key=settings.TAVILY_API_KEY)

def research_agent(topic: str) -> dict:
    logger.info(f"Researcher fetching data for topic='{topic}'")
    try:
        results = client.search(query=topic, search_depth="advanced", max_results=5)
        raw_hits = results.get("results", [])
    except Exception as e:
        logger.warning(f"Tavily search failed: {e}. Proceeding without live data.")
        raw_hits = []

    # Ingest into vector store for RAG
    if raw_hits:
        ingest_research_results(topic, raw_hits)

    past_context = query_historical_context(topic, k=3)
    web_content = "\n\n".join([f"Source: {r.get('url','')}\n{r.get('content','')}" for r in raw_hits])

    combined = f"LIVE SEARCH RESULTS:\n{web_content}\n\nHISTORICAL CONTEXT FROM VECTOR STORE:\n{past_context}"

    prompt = f"""You are an expert research analyst. Synthesize the following data into a comprehensive research summary for a technical content writer.
Preserve all metrics, statistics, citations, and technical details.

DATA:
{combined}
"""
    response = llm.invoke(prompt)
    logger.info(f"Researcher completed — {len(raw_hits)} sources ingested")
    return {
        "sources": raw_hits,
        "summary": response.content,
        "source_count": len(raw_hits)
    }
