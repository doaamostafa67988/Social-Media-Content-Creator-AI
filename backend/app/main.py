from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.routes.content import router as content_router
from app.utils.logger import get_logger

logger = get_logger("main")

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ContentForge API",
    description="Autonomous Content Pipeline — Multi-Agent AI Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(content_router)

@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "service": "ContentForge API", "version": "1.0.0"}

@app.get("/health", tags=["health"])
def healthcheck():
    return {"status": "healthy"}
