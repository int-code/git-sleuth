
import asyncio
import httpx
from config import celery_app
from utils.auth_helper import get_or_refresh_installation_token


def get_latest_commit_info(repo_full_name, branch, token):
    headers = {"Authorization": f"token {token}"}
    res = httpx.get(
        f"https://api.github.com/repos/{repo_full_name}/git/ref/heads/{branch}",
        headers=headers
    )
    ref_info = res.json()
    commit_sha = ref_info["object"]["sha"]

    commit_data = httpx.get(
        f"https://api.github.com/repos/{repo_full_name}/git/commits/{commit_sha}",
        headers=headers
    ).json()

    tree_sha = commit_data["tree"]["sha"]
    return commit_sha, tree_sha

def create_blob(repo_full_name, content, token):
    headers = {"Authorization": f"token {token}"}
    res = httpx.post(
        f"https://api.github.com/repos/{repo_full_name}/git/blobs",
        json={"content": content, "encoding": "utf-8"},
        headers=headers
    )
    return res.json()["sha"]

def create_tree(repo_full_name, base_tree, files, token):
    """
    files: list of dicts with 'path' and 'sha' keys
    """
    headers = {"Authorization": f"token {token}"}
    tree_items = [
        {
            "path": file["path"],
            "mode": "100644",
            "type": "blob",
            "sha": file["sha"]
        }
        for file in files
    ]
    res = httpx.post(
        f"https://api.github.com/repos/{repo_full_name}/git/trees",
        json={"base_tree": base_tree, "tree": tree_items},
        headers=headers
    )
    return res.json()["sha"]


def create_commit(repo_full_name, message, tree_sha, parent_sha, token):
    headers = {"Authorization": f"token {token}"}
    res = httpx.post(
        f"https://api.github.com/repos/{repo_full_name}/git/commits",
        json={
            "message": message,
            "tree": tree_sha,
            "parents": [parent_sha]
        },
        headers=headers
    )
    return res.json()["sha"]

def update_ref(repo_full_name, branch, commit_sha, token):
    headers = {"Authorization": f"token {token}"}
    httpx.patch(
        f"https://api.github.com/repos/{repo_full_name}/git/refs/heads/{branch}",
        json={"sha": commit_sha},
        headers=headers
    )
    
def get_default_branch(repo_full_name, token):
    headers = {"Authorization": f"token {token}"}
    res = httpx.get(
        f"https://api.github.com/repos/{repo_full_name}",
        headers=headers
    )
    return res.json().get("default_branch", "main")

@celery_app.task
def setup_workflow_files(repo_full_name, installation_id):
    token = asyncio.run(get_or_refresh_installation_token(installation_id)) 
    file_paths = ["merge-conflict.yaml", "apply-resolution.yaml"]
    local_file_dir = "workflow_files/"
    repo_file_dir = ".github/workflows/"
    branch = get_default_branch(repo_full_name, token)
    commit_sha, tree_sha = get_latest_commit_info(repo_full_name, branch, token)
    files_data = []
    for file_path in file_paths:
        with open(local_file_dir+file_path, "r") as file:
            content = file.read()
        blob_sha = create_blob(repo_full_name, content, token)
        files_data.append({"path": repo_file_dir+file_path, "sha": blob_sha})

    new_tree_sha = create_tree(repo_full_name, tree_sha, files_data, token)
    new_commit_sha = create_commit(repo_full_name, "Setup multiple workflow files", new_tree_sha, commit_sha, token)
    update_ref(repo_full_name, branch, new_commit_sha, token)

    return new_commit_sha