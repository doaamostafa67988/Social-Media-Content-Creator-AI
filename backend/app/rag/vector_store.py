import os
from langchain_chroma import Chroma
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# Suppress local symlink tracking warnings for transformers
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# Initialize Persistent Chroma Storage
vector_store = Chroma(
    collection_name="content_pipeline",
    embedding_function=embedding,
    persist_directory="./chroma_db"
)

def ingest_research_results(topic: str, raw_results: list):
    """
    Chunks and writes search results down to internal vector space
    to allow multi-turn contextual tracking or cross-topic referencing.
    """
    documents = []
    for item in raw_results:
        doc = Document(
            page_content=item.get("content", ""),
            metadata={"source": item.get("url", ""), "topic": topic}
        )
        documents.append(doc)
    
    if not documents:
        return
        
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=100)
    split_docs = text_splitter.split_documents(documents)
    vector_store.add_documents(split_docs)

def query_historical_context(query: str, k: int = 3) -> str:
    """
    Allows agents to pull internal historical content insights 
    outside of generic live Google/Tavily searches.
    """
    try:
        docs = vector_store.similarity_search(query, k=k)
        return "\n\n".join([d.page_content for d in docs])
    except Exception:
        return ""