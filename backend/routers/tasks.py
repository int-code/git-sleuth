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
    pubsub = r.pubsub()
    await pubsub.subscribe(task_id)

    async def event_generator():
        try:
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=10)
                if message:
                    yield f"data: {message['data'].decode()}\n\n"
                await asyncio.sleep(0.5)
        finally:
            await pubsub.unsubscribe(task_id)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
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
    