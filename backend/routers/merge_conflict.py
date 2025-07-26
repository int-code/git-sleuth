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

@mc_router.post("/resolve_conflicts")
def resolve_conflicts(data: ConflictResolutionRequest, db=Depends(get_db)):
    task = Task(id=data.task_id, status="queued", task_type="Resolve_conflict_AI", file_path=data.file_path)
    db.add(task)
    db.commit()
    resolve_conflict.delay(data.file, data.task_id)
