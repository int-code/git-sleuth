from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from db import Base
from datetime import datetime

class MergeConflict(Base):
    __tablename__ = 'merge_conflicts'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    pr_id = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default='open')
    created_at = Column(DateTime, nullable=False, default=datetime.now)