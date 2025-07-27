from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from utils.merge_conflict_tools import resolve_conflict
from db import get_db
from models.taskLog import Task

mc_router = APIRouter()

class ConflictResolutionRequest(BaseModel):
    file: str
    file_path: str
    task_id: str
    merge_id: int

@mc_router.post("/resolve_conflicts")
def resolve_conflicts(data: ConflictResolutionRequest, db=Depends(get_db)):
    celery_task = resolve_conflict.delay(data.file, data.task_id)
    task = Task(id=data.task_id, status="queued", task_type="Resolve_conflict_AI", merge_id=data.merge_id, celery_task_id=celery_task.id)
    db.add(task)
    db.commit()
