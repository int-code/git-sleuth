from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
import os

from routers.auth import auth_router
from routers.webhook import webhook_router
from routers.merge_conflict import mc_router
from routers.tasks import task_router
from db import init_db
from logger import setup_logging

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # Initialize the database
    yield

setup_logging()

app = FastAPI(lifespan=lifespan)

# Session middleware (for OAuth)
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET_KEY"),
    session_cookie="session"
)

# Routes
@app.get("/")
async def home(request: Request):
    return "Server is up and running!"


app.include_router(auth_router, tags=["auth"])
app.include_router(webhook_router, tags=["webhook"])
app.include_router(mc_router, tags=["merge-conflict"])
app.include_router(task_router, tags=["task"])
