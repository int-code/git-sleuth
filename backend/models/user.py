from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, BigInteger
from db import Base
from datetime import datetime


class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True, unique=True)
    avatar_url = Column(String, nullable=True)
    github_id = Column(BigInteger, nullable=False, unique=True)
    bio = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)