from fastapi import APIRouter, Depends, HTTPException
from db import get_db

from models.taskLog import Task


task_router = APIRouter()


@task_router.get("/get-task/{task_id}")
def get_task_status(task_id: str, db=Depends(get_db)):
    """
    Endpoint to get the status of a task by its ID.
    """
    print(f"Fetching status for task ID: {task_id}")
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task
    