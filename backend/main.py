from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes_todo import router as todo_router
from app.core.config import settings

app = FastAPI(title="NextJS FastAPI Integration")

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"ok": True, "secret_loaded": bool(settings.API_SECRET_KEY)}

app.include_router(todo_router)