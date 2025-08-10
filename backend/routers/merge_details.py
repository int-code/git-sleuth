from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from db import get_db

from utils.auth_helper import jwt_required
from models.repo import Repository
from models.pr import PullRequests
from models.merge_conflicts import MergeConflict


merge_details_router = APIRouter()

@merge_details_router.get("/merge-details")
@jwt_required
def get_merge_details(request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    repos = db.query(Repository).filter(Repository.user_id == user.id).all()
    prs = db.query(PullRequests).filter(PullRequests.repo_id.in_([repo.id for repo in repos])).all()
    merge_conflicts = db.query(MergeConflict).filter(MergeConflict.pr_id.in_([pr.id for pr in prs])).all()
    active_conflicts_suggestions = [conflict for conflict in merge_conflicts if conflict.status in ['open', 'escalated', 'resolved']]
    resolved_conflicts_suggestions = [conflict for conflict in merge_conflicts if conflict.status in ['closed', 'accepted', 'rejected']]

    pr_info = []
    for repo in repos:
        curr_prs = [pr for pr in prs if pr.repo_id == repo.id]
        pr_info.append({**repo.__dict__, 'pull_requests': [pr.__dict__ for pr in curr_prs]})
    
    return {
        "total_repos": len(repos),
        "total_prs": len(prs),
        "active_conflicts_suggestions": len(active_conflicts_suggestions),
        "resolved_conflicts_suggestions": len(resolved_conflicts_suggestions),
        "pr_info": pr_info,
    }