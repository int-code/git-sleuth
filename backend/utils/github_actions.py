import subprocess
import os

def get_file_content(access_token, owner, repo, path, branch="main"):
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}"
    headers = {"Authorization": f"token {access_token}"}
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    content = base64.b64decode(response.json()["content"]).decode("utf-8")
    return content


def update_file(access_token, owner, repo, path, content, message, branch="main"):
    # First get the file's SHA
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}"
    headers = {"Authorization": f"token {access_token}"}
    
    # Get current file info
    response = requests.get(url, headers=headers)
    sha = response.json()["sha"]
    
    # Update the file
    update_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    data = {
        "message": message,
        "content": base64.b64encode(content.encode("utf-8")).decode("utf-8"),
        "sha": sha,
        "branch": branch
    }
    
    response = requests.put(update_url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()


def create_branch(access_token, owner, repo, new_branch, base_branch="main"):
    # Get the SHA of the base branch
    url = f"https://api.github.com/repos/{owner}/{repo}/git/refs/heads/{base_branch}"
    headers = {"Authorization": f"token {access_token}"}
    
    response = requests.get(url, headers=headers)
    base_sha = response.json()["object"]["sha"]
    
    # Create new branch
    create_url = f"https://api.github.com/repos/{owner}/{repo}/git/refs"
    data = {
        "ref": f"refs/heads/{new_branch}",
        "sha": base_sha
    }
    
    response = requests.post(create_url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()


def create_pr_with_changes(access_token, owner, repo, changes, pr_title, pr_body):
    # Create a new branch
    branch_name = f"auto-update-{int(time.time())}"
    create_branch(access_token, owner, repo, branch_name)
    
    # Make changes in the new branch
    for file_path, new_content in changes.items():
        update_file(
            access_token,
            owner,
            repo,
            file_path,
            new_content,
            f"Auto-update {file_path}",
            branch_name
        )
    
    # Create pull request
    pr_url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
    headers = {"Authorization": f"token {access_token}"}
    data = {
        "title": pr_title,
        "body": pr_body,
        "head": branch_name,
        "base": "main"
    }
    
    response = requests.post(pr_url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()