from math import ceil
from fastapi import APIRouter, Depends, Request
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from db import get_db
from models.pr import PullRequests
from models.merge_conflicts import MergeConflict
from models.repo import Repository
from models.user import User
from models.resolved_code import Resolved_code
from utils.auth_helper import jwt_required

dashboard_router = APIRouter()

@dashboard_router.get("/dashboard")
@jwt_required
def get_statusbar_data(request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    # Example logic, tweak as needed
    
    # active_monitors = db.query(Task).filter(Task.status == "resolving").count()

    # System operational if no merge_conflicts are open for >30 mins
    threshold_time = datetime.now() - timedelta(minutes=30)
    old_open_conflicts = db.query(MergeConflict).filter(
        MergeConflict.status == 'open',
        MergeConflict.created_at < threshold_time
    ).count()
    systems_operational = old_open_conflicts == 0

    # Realtime processing: any task with status == running
    # realtime_processing = active_monitors > 0

    pr = db.query(PullRequests).join(Repository, PullRequests.repo_id == Repository.id).join(User, User.id == Repository.user_id).filter(
        User.id == user.id,
    ).all()
    this_week_pr = [x for x in pr if x.created_at >= datetime.now() - timedelta(days=7)]
    prev_week_pr = [x for x in pr if x.created_at < datetime.now() - timedelta(days=7) and x.created_at >= datetime.now() - timedelta(days=14)]
    
    pr_count = len(this_week_pr)
    pr_change = len(this_week_pr) - len(prev_week_pr)
    pr_change_percentage = (pr_change / len(prev_week_pr) * 100) if prev_week_pr else 0

    pr_ids = [pr.id for pr in pr]
    conflicts = db.query(MergeConflict).filter(MergeConflict.pr_id.in_(pr_ids)).all()

    num_resolved = 0
    num_pending = 0
    num_accepted = 0
    for conflict in conflicts:
        if conflict.status in ['resolved', 'accepted', 'rejected']:
            if conflict.status == 'accepted':
                num_accepted += 1
            num_resolved += 1
        elif conflict.status in ['open', 'escalated']:
            num_pending += 1
    
    conflict_ids = [conflict.id for conflict in conflicts]
    resolved_code = db.query(Resolved_code).filter(Resolved_code.merge_conflict_id.in_(conflict_ids)).all()

    confidence_calc = [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]]
    for resolved in resolved_code:
        pos = ceil(resolved.confidence_score/10)-1 
        conflict = filter(lambda x: x.id == resolved.merge_conflict_id, conflicts)
        if conflict and next(conflict).status == 'accepted':
            confidence_calc[pos][0] += 1
        elif conflict and next(conflict).status == 'rejected':
            confidence_calc[pos][1] += 1
    
    conflict_matrix = {}
    for conflict in conflicts:
        if conflict.created_at < datetime.now() - timedelta(days=7):
            continue
        if conflict.status in ['resolved', 'accepted', 'rejected']:
            conflict_matrix[func.to_char(conflict.created_at, 'Day')]['resolved'] += 1
        elif conflict.status == 'open':
            conflict_matrix[func.to_char(conflict.created_at, 'Day')]['pending'] += 1
        elif conflict.status == 'escalated':
            conflict_matrix[func.to_char(conflict.created_at, 'Day')]['escalated'] += 1
        else:
            conflict_matrix[func.to_char(conflict.created_at, 'Day')]['closed'] += 1

    pr_conflict_timing = [[0,0] for _ in range(5)]
    for pr in pr:
        hr = func.extract('hour', pr.created_at)
        if hr>=8 and hr<11:
            pr_conflict_timing[0][0] +=1
        elif hr>=11 and hr<14:
            pr_conflict_timing[1][0] +=1
        elif hr>=14 and hr<17:
            pr_conflict_timing[2][0] +=1
        elif hr>=17 and hr<20:
            pr_conflict_timing[3][0] +=1
        elif hr>=20 or hr<8:
            pr_conflict_timing[4][0] +=1
    for conflict in conflicts:
        hr = func.extract('hour', conflict.created_at)
        if hr>=8 and hr<11:
            pr_conflict_timing[0][1] +=1
        elif hr>=11 and hr<14:
            pr_conflict_timing[1][1] +=1
        elif hr>=14 and hr<17:
            pr_conflict_timing[2][1] +=1
        elif hr>=17 and hr<20:
            pr_conflict_timing[3][1] +=1
        elif hr>=20 or hr<8:
            pr_conflict_timing[4][1] +=1

    

    return {
        "systems_operational": systems_operational,
        "pr_count": pr_count,
        "pr_change_percentage": pr_change_percentage,
        "num_resolved": num_resolved,
        "num_pending": num_pending,
        "num_accepted": num_accepted,
        "confidence_matrix": confidence_calc,
        "conflict_matrix": conflict_matrix,
        "pr_conflict_timing": pr_conflict_timing


    }
