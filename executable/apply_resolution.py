import subprocess
import requests

def apply_resolution(merge_id: str, head_branch: str, base_branch:str):
    try:
        api_url = "https://git-sleuth-api.pubali.dev/"
        res = api_url+"/get-merge/"+merge_id
        response = requests.get(res)
        response.raise_for_status()  # Raise an error for bad responses
        merge_data = response.json()
        if merge_data.get("status") != "resolved":
            print(f"Task {merge_data.task_id} is not resolved yet.")
            return
        branch = merge_data.get("resolved_code_branch")
        file_paths = merge_data.get("file_paths")
        if not branch or not file_paths:
            print("No resolution or file path found in task data.")
            return
        print(f"Checking out head branch: {head_branch}")
        subprocess.run(["git", "checkout", head_branch], check=True)

        print("Merging main into head branch")
        subprocess.run(["git", "merge", base_branch], check=True)

        print(f"Copying resolved files from {branch} into {head_branch}...")
        for file_path in file_paths:
            # Get the file contents from the resolved branch
            subprocess.run(["git", "checkout", branch, "--", file_path], check=True)

        print("Adding and committing the copied files")
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", f"Apply resolved changes from {branch}"], check=True)

        print(f"Pushing to origin/{head_branch}")
        subprocess.run(["git", "push", "origin", head_branch], check=True)

        print("✅ Resolution applied and pushed.")

    except subprocess.CalledProcessError as e:
        print(f"❌ Git error: {e}")
    except requests.RequestException as e:
        print(f"❌ API error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")