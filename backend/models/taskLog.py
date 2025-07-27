from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, BigInteger
from db import Base
from datetime import datetime


class Task(Base):
    __tablename__ = 'task'

    id = Column(String, primary_key=True, index=True)
    pr_id = Column(Integer, nullable=True)
    status = Column(String, nullable=False, default='queued')
    task_type = Column(String, nullable=False)
    merge_id = Column(Integer, nullable=True)
    celery_task_id = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)

