from sqlalchemy import Column, Integer, String, Boolean, DateTime, BigInteger
from sqlalchemy import Column, Integer, String, Boolean, DateTime, BigInteger
from db import Base
from datetime import datetime

class Repository(Base):
    __tablename__ = 'repositories'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    installation_id = Column(BigInteger, nullable=False)
    github_id = Column(BigInteger, unique=True, nullable=False)
    node_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    private = Column(Boolean, nullable=False)
    status = Column(String, nullable=False, default='active')
    created_at = Column(DateTime, nullable=False, default=datetime.now)
