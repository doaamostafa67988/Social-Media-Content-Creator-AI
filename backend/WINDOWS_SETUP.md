# Running ContentForge on Windows

## The short version

You only need **2 terminals** on Windows — no Redis, no Celery.

---

## Step 1 — Fill in your API keys

Open `backend/.env` and set:

```
GROQ_API_KEY=your_key_here       ← get from https://console.groq.com (free)
TAVILY_API_KEY=your_key_here     ← get from https://tavily.com (free tier)
```

---

## Step 2 — Backend (Terminal 1)

```cmd
cd "Social Media Content\backend"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Open http://localhost:8000/docs to confirm it's running.

---

## Step 3 — Frontend (Terminal 2)

```cmd
cd "Social Media Content\frontend"
npm install
npm run dev
```

✅ Open http://localhost:3000

---

## ❌ Do NOT run Celery or Redis on Windows

The pipeline now runs using FastAPI's built-in background threads.
Redis and Celery are **not needed** and will cause the error you saw:

```
ConnectionRefusedError: [WinError 10061] No connection could be made
```

---

## First run notes

- The first run downloads the HuggingFace embedding model (~90MB). This is normal.
- SQLite database (`content_db.db`) is created automatically on first start.
- ChromaDB vector store (`chroma_db/`) is created automatically on first pipeline run.

---

## Getting API Keys

| Key | Where to get it | Cost |
|-----|----------------|------|
| `GROQ_API_KEY` | https://console.groq.com → API Keys | Free |
| `TAVILY_API_KEY` | https://app.tavily.com → API Keys | Free (1000 req/month) |

---

## Troubleshooting

**"Module not found" errors:**
```cmd
pip install -r requirements.txt --upgrade
```

**Port 8000 already in use:**
```cmd
uvicorn app.main:app --reload --port 8001
```
Then update `frontend/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:8001`

**Pipeline stuck on RUNNING:**
Check the uvicorn terminal — errors will appear there with full stack traces.
