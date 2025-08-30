from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from db import get_db

from utils.auth_helper import jwt_required
from models.repo import Repository
from models.pr import PullRequests
from models.merge_conflicts import MergeConflict


user_router = APIRouter()

@user_router.get("/user")
@jwt_required
async def get_merge_details(request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    return user