from celery.result import AsyncResult
from fastapi import Request, HTTPException
from typing import Optional
import httpx
import asyncio
import json

from utils.utils import add_task
from models.pr import PullRequests
from config import celery_app
from routers.auth import get_or_refresh_installation_token
from db import get_db
from models.repo import Repository
from models.merge_conflicts import MergeConflict
from models.taskLog import Task

async def fetch_pr_details(owner: str, repo: str, pr_number: int, installation_id: int) -> dict:
    """Poll GitHub API for PR details until mergeable is not null"""
    print("installation_id", installation_id)
    print(f"Fetching PR details for {owner}/{repo}#{pr_number}")
    GITHUB_ACCESS_TOKEN = await get_or_refresh_installation_token(installation_id)
    print(f"access token {GITHUB_ACCESS_TOKEN}")
    HEADERS = {
        "Authorization": f"Bearer {GITHUB_ACCESS_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"
    async with httpx.AsyncClient() as client:
        for _ in range(5):  # Retry up to 5 times
            response = await client.get(url, headers=HEADERS)
            if response.status_code != 200:
                raise Exception("GitHub API error")
            
            pr_data = response.json()
            if pr_data["mergeable"] is not None:  # Mergeability calculated
                return pr_data
            
            await asyncio.sleep(3)  # Wait 3 seconds before retrying
        
        raise Exception("Mergeability check timeout")
    

async def check_pr_mergeable(data):

    if data.get("mergeable") is None:
        try:
            # Fetch updated PR details with mergeable status
            updated_pr = await fetch_pr_details(
                owner=data["repository"]["owner"]["login"],
                repo=data["repository"]["name"],
                pr_number=data["number"],
                installation_id=data["installation"]["id"]
            )
            
            return updated_pr["mergeable"]
                
        except Exception as e:
            print(f"Error checking mergeability: {e}")
            raise e

def add_pr_to_database(db, data):
    repo = db.query(Repository).filter_by(github_id=data["repository"]["id"]).first()
    if not repo:
        raise ValueError("Repository not found in the database")
    pr = PullRequests(
        repo_id=repo.id,
        pr_number=data["number"],
        installation_id= data["installation"]["id"],
        url=data["pull_request"]["url"],
        github_id=data["pull_request"]["id"],
        node_id=data["pull_request"]["node_id"],
        state=data["pull_request"]["state"],
        title=data["pull_request"]["title"],
        closed_at=data["pull_request"]["closed_at"],
        merged_at=data["pull_request"]["merged_at"],
        mergeable=data["pull_request"]['mergeable'],  # Initially set to None, will be updated later
        commits=data["pull_request"]["commits"],
        details=json.dumps(data)  # Store the full PR data as a string
    )
    db.add(pr)
    db.commit()
    db.refresh(pr)
    return pr

async def trigger_workflow(repo_name, owner, action_workflow_filename, base_branch, head_branch, GITHUB_TOKEN, merge_id):

    # Trigger GitHub Action workflow_dispatch
    url = f"https://api.github.com/repos/{owner}/{repo_name}/actions/workflows/{action_workflow_filename}/dispatches"
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json"
    }
    json_data = {
        "ref":base_branch,  # run action on base branch (e.g., main)
        "inputs": {
            "head_ref": head_branch,
            "base_ref": base_branch,
            "merge_id": merge_id
        }
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, json=json_data)
        if resp.status_code != 204:
            raise Exception(f"Failed to trigger workflow: {resp.text}")

@celery_app.task
def handle_new_pr(data):
    try:
        db = next(get_db())
        if data['action'] == "opened":
            pr = add_pr_to_database(db, data)
            mc = None
        elif data['action'] == "synchronize":
            pr = db.query(PullRequests).filter_by(github_id=data["pull_request"]["id"]).first()
            if not pr:
                pr = add_pr_to_database(db, data)
                mc = None
            else:
                mc = db.query(MergeConflict).filter_by(pr_id=pr.id).first()
                if mc:
                    task = db.query(Task).filter(Task.merge_id == mc.id).first()
                    if task.status in ["queued", "resolving"]:
                        result = AsyncResult(task.celery_task_id)
                        result.revoke(terminate=True, signal='SIGTERM')
                        task.status = "terminated"
                        db.commit()
            pr.state = data["pull_request"]["state"]
            pr.title = data["pull_request"]["title"]
            pr.closed_at = data["pull_request"]["closed_at"]
            pr.merged_at = data["pull_request"]["merged_at"]
            pr.commits = data["pull_request"]["commits"]
            pr.details = json.dumps(data)
        elif data['action'] == "closed":
            pr = db.query(PullRequests).filter(PullRequests.github_id==data["pull_request"]["id"]).first()
            if not pr:
                pr = add_pr_to_database(db, data)
                mc = MergeConflict(pr_id = pr.id, status="closed")
                db.add(mc)
            else:
                pr.closed_at = data["pull_request"]["closed_at"]
                pr.merged_at = data["pull_request"]["merged_at"]
                mc = db.query(MergeConflict).filter(MergeConflict.pr_id==pr.id, MergeConflict.status in ['queued', 'resolving', 'open']).first()
                if mc:
                    mc.status = "closed"
                    celery_resolve_task = db.query(Task).filter(Task.merge_id==mc.id, Task.task_type == "Resolve_conflict_AI")
                    if celery_resolve_task and celery_resolve_task.status in ["queued", "resolving"]:
                        result = AsyncResult(celery_resolve_task.celery_task_id)
                        result.revoke(terminate=True, signal='SIGTERM')
                        celery_resolve_task.status = "terminated"
                        db.commit()
                else:
                    mc = MergeConflict(pr_id = pr.id, status="closed")
                    db.add(mc)
        elif data['action'] == 'reopened':
            pr = db.query(PullRequests).filter(PullRequests.github_id==data["pull_request"]["id"]).first()
            if not pr:
                pr = add_pr_to_database(db, data)
            else:
                mc = db.query(MergeConflict).filter(MergeConflict.pr_id==pr.id, MergeConflict.status == "closed").first()
                if mc:
                    mc.status = "open"
                    celery_resolve_task = db.query(Task).filter(Task.merge_id==mc.id, Task.task_type == "Resolving_conflicts")
                    if celery_resolve_task and celery_resolve_task.status in ["queued", "resolving"]:
                        result = AsyncResult(celery_resolve_task.celery_task_id)
                        result.revoke(terminate=True, signal='SIGTERM')
                        celery_resolve_task.status = "terminated"
                        db.commit()

        mergeable = asyncio.run(check_pr_mergeable(data))
        pr.mergeable = mergeable
        db.commit()
        db.refresh(pr)
        if not mergeable:
            if mc:
                mc.status = "open"
                db.commit()
            else:
                mc = MergeConflict(pr_id=pr.id, status="open")
                db.add(mc)
                db.commit()
            celery_task = resolve_merge_conflicts.delay(data)
            add_task("merge_conflicts", "queued", celery_task.id, pr_id=pr.id, merge_id=mc.id)
        elif mc:
            mc.status = "overwritten"
            db.commit()
    except Exception as e:
        print(f"Error handling new PR: {e}")
        raise Exception("Error processing PR data")
    

@celery_app.task
def resolve_merge_conflicts(data):
    installation_token = asyncio.run(get_or_refresh_installation_token(data["installation"]["id"]))
    headers = {
        "Authorization": f"Bearer {installation_token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "MyGitHubApp"
    }

    body_data = {
        "ref": "main",  # or your branch
        "inputs": {
            "head_ref": data['pull_request']['head']['ref'],
            "base_ref": data['pull_request']['base']['ref'], 
        } 
    }

    response = httpx.post(
        f"https://api.github.com/repos/{data['repository']['full_name']}/actions/workflows/merge-conflict.yaml/dispatches",
        headers=headers,
        json=body_data
    )

    print(response.status_code, response.text)