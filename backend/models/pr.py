from sqlalchemy import Column, Integer, String, Boolean, DateTime
from db import Base
from datetime import datetime

class PullRequests(Base):
    __tablename__ = 'pr'

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, nullable=False)
    pr_number = Column(Integer, nullable=False)
    installation_id = Column(Integer, nullable=False)
    url = Column(String, nullable=False)
    github_id = Column(Integer, unique=True, nullable=False)
    node_id = Column(String, unique=True, nullable=False)
    state = Column(String, nullable=False)
    title = Column(String, nullable=False)
    closed_at = Column(DateTime, nullable=True)
    merged_at = Column(DateTime, nullable=True)
    mergeable = Column(Boolean, nullable=True)
    commits = Column(Integer, nullable=False, default=0)
    details = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
