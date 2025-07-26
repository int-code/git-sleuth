import random
import string

from db import get_db
from models.taskLog import Task


def add_task(task_type, status, celery_task_id, pr_id=None, merge_id=None):
    """Add a new task to the database."""
    db = next(get_db())
    task = Task(
        pr_id=pr_id,
        status=status,
        task_type=task_type,
        merge_id=merge_id,
        celery_task_id=celery_task_id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def generate_random_alphanumeric_string(length=16):
    """Generate a random alphanumeric string of specified length."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))