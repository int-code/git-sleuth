import json
from fastapi import APIRouter, Depends, HTTPException
from db import get_db
from fastapi.responses import StreamingResponse
import asyncio

from models.taskLog import Task
from models.merge_conflicts import MergeConflict
from models.resolved_code import Resolved_code
from redis_setup import get_redis


task_router = APIRouter()


@task_router.get("/get-task/{task_id}")
async def get_task_status(task_id: str, db=Depends(get_db)):
    """
    Endpoint to get the status of a task by its ID.
    """
    r = get_redis()
    result = await r.get(f"task_result:{task_id}")
    if result:
        return json.loads(result)
    return None

    # print(f"Fetching status for task ID: {task_id}")
    # task = db.query(Task).filter(Task.id == task_id).first()
    # if not task:
    #     raise HTTPException(status_code=404, detail="Task not found")
    # if task.status == "resolved":
    #     resolved_code = db.query(Resolved_code).filter(Resolved_code.task_id==task.id).first()
    #     return {
    #         "status": task.status,
    #         "confidence_score": resolved_code.confidence_score,
    #         "resolved_code": resolved_code.
    #     }
    
    # return task
    