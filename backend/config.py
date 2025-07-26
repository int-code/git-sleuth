import os
from celery import Celery


celery_app = Celery(
    "worker",
    broker=f"redis://{os.getenv("REDIS_HOST")}:{os.getenv("REDIS_PORT")}/0",
    backend=f"redis://{os.getenv("REDIS_HOST")}:{os.getenv("REDIS_PORT")}/0"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",  # or UTC
    enable_utc=True,
)
