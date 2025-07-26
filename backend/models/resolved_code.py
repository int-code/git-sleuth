from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from db import Base
from datetime import datetime


class MergeConflict(Base):
    __tablename__ = 'resolved_code'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    merge_conflict_id = Column(Integer, nullable=False)
    file_path = Column(String, nullable=False)
    resolved_code_branch = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)