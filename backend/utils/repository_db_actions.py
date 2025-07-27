from config import celery_app
from models.repo import Repository

from db import get_db
from utils.setup_workflow_files import setup_workflow_files

@celery_app.task
def handle_add_repositories(repositories: list, installation_id: int = None):
    db_session = next(get_db())
    for repo in repositories:
        setup_workflow_files.delay(repo['full_name'], installation_id)
        github_id = repo.pop('id')
        entry = db_session.query(Repository).filter(Repository.github_id == github_id).first()
        if entry:
            entry.status = "active"
            db_session.commit()
        else:
            new_entry = Repository(installation_id=installation_id, github_id=github_id, **repo)
            db_session.add(new_entry)
    db_session.commit()


@celery_app.task
def handle_remove_repositories(repositories):
    db_session = next(get_db())
    for repo in repositories:
        entry = db_session.query(Repository).filter_by(github_id=repo['id']).first()
        if entry:
            entry.status = 'removed'
        else:
            raise ValueError(f"Repository with ID {repo['id']} not found in the database")
    db_session.commit()