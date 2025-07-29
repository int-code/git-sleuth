from langchain.agents import Tool
from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain.chat_models import init_chat_model
from langchain.schema import SystemMessage, HumanMessage
from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool
from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser
from dotenv import load_dotenv

from models.merge_conflicts import MergeConflict
from models.resolved_code import Resolved_code
from utils.utils import generate_random_alphanumeric_string
from config import celery_app
from db import get_db
from models.taskLog import Task
from redis_setup import get_redis
import json

load_dotenv()

creative_llm = ChatOpenAI(
        model_name="gpt-3.5-turbo",
        temperature=0.7,
        verbose=True)

analytical_llm = ChatOpenAI(
        model_name="gpt-4o",
        temperature=0.0)

class IntentSummary(BaseModel):
    head: str = Field(..., description="Summary of HEAD code intent")
    base: str = Field(..., description="Summary of BASE code intent")

class ConfidenceScore(BaseModel):
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0 and 1")


intent_parser = PydanticOutputParser(pydantic_object=IntentSummary)
intent_prompt = PromptTemplate(template="You are a code assistant. For each code chunk, summarize intent separately for both head and base code. Code Chunk: {input_text}\n {format_instructions}", 
                               partial_variables = {"format_instructions": intent_parser.get_format_instructions()})

confidence_parser = PydanticOutputParser(pydantic_object=ConfidenceScore)
conf_prompt = PromptTemplate(template="You are a code assistant tasked with scoring how confident you are in the resolution of a merge conflict. Use the context as necessary as well\nMerge Conflict: {input_text}\nContext: {context}\n{format_instructions}",
                             partial_variables={"format_instructions": confidence_parser.get_format_instructions()})

@tool
def get_summary_of_conflict_chunk(conflict_chunk: str) -> IntentSummary:
    """
    Uses an LLM to analyze a conflict chunk and return a summary of the intent of the code.
    The conflict chunk is expected to be in the format of a git conflict marker.
    The summary should include the intent of both the HEAD and BASE versions of the code.
    """
    chain = intent_prompt | creative_llm 
    response = chain.invoke({"input_text": conflict_chunk})
    res = intent_parser.parse(response.content)
    return res

@tool
def get_confidence_score(conflict_chunk: str, context: str) -> float:
    """
    Uses an LLM to analyze a conflict chunk and the context and return a confidence score.
    The score is between 0 and 1, where 1 means high confidence in the resolution.
    """
    chain = conf_prompt | analytical_llm 
    response = chain.invoke({"input_text": conflict_chunk, "context": context})
    res = confidence_parser.parse(response.content)
    return res.confidence

@tool
def get_conflict_markers(file_content: str) -> List[str]:
    """Extracts conflict blocks from a file content that contains git conflict markers.
    """
    conflict_blocks = []

    in_conflict = False
    current_block = []
    lines = file_content.splitlines(keepends=True)

    for line in lines:
        if line.startswith("<<<<<<<"):
            in_conflict = True
            current_block = [line]
        elif in_conflict:
            current_block.append(line)
            if line.startswith(">>>>>>>"):
                in_conflict = False
                conflict_blocks.append("".join(current_block))
                current_block = []

    return conflict_blocks

class ResolvedCode(BaseModel):
    resolved_code: str = Field(..., description="The resolved code after merging the conflict")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score of the resolution between 0 and 1")

react_model = init_chat_model(
    model="gpt-4o",
    temperature=0
)

agent = create_react_agent(
    model=react_model,  
    tools=[get_summary_of_conflict_chunk, get_confidence_score, get_conflict_markers],  
    prompt="""You are a helpful assistant that can resolve code conflicts. 
    Return the resolved code along with a confidence score. 
    Do not return anything else. Do not show preference for one branch over another.
    If both branches have valid code, merge them intelligently.""",
    # debug=True,
    response_format=ResolvedCode
)

@celery_app.task(name="resolve_conflict")
def resolve_conflict(conflict_chunk: str, task_id: str, file_path: str) -> ResolvedCode:
    """
    Resolves a conflict chunk using the agent.
    The conflict chunk is expected to be in the format of a git conflict marker.
    Returns the resolved code and confidence score.
    """
    db = next(get_db())
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise ValueError(f"Task with ID {task_id} not found in the database")
    
    merge = db.query(MergeConflict).filter(MergeConflict.id == task.merge_id).first()
    if not merge:
        raise ValueError(f"MergeConflict with ID {task.merge_id} not found in the database")
    
    task.status = "resolving"
    db.commit()
    response = agent.invoke(
        {"messages": [{"role": "user", "content": conflict_chunk}]}
    )
    
    resolved_code = response['structured_response']
    
    task.status = "resolved"
    print(f"Resolved code: {resolved_code.resolved_code}")
    print(f"Confidence score: {resolved_code.confidence_score}")
    resolved_code_branch = "fix: auto-fix-"+generate_random_alphanumeric_string()
    new_resolved_code = Resolved_code(merge_conflict_id=merge.id, 
                                      file_path=file_path, 
                                      resolved_code_branch=resolved_code_branch, 
                                      confidence_score=resolved_code.confidence_score,
                                      task_id=task.id)
    db.add(new_resolved_code)
    db.commit()
    r = get_redis()
    res_body = {
        "resolved_code": resolved_code.resolved_code,
        "confidence_score": resolved_code.confidence_score,
        "branch": merge.resolved_code_branch
    }
    result = json.dumps(res_body)
    r.publish(task_id, result)
    r.publish(task_id, "[DONE]")

    return None











if __name__ == "__main__":
    conflict_chunk_with_markers = """# multiple_conflicts.py
def greet():
<<<<<<< HEAD
    print("Hi there from HEAD!")
=======
    print("Heya from feature branch!")
>>>>>>> feature-branch

def add(a, b):
    return a + b

<<<<<<< HEAD
def multiply(a, b):
    result = a * b
    print(f"Multiplication result is {result}")
=======
def multiply(a, b):
    print("Multiplying numbers...")
    return a * b
>>>>>>> feature-branch

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

<<<<<<< HEAD
# New utility function
def log(msg):
    print(f"[LOG]: {msg}")
=======
# Utility function with timestamp
import datetime
def log(msg):
    print(f"[{datetime.datetime.now()}] {msg}")
>>>>>>> feature-branch
"""
    response = agent.invoke(
        {"messages": [{"role": "user", "content": conflict_chunk_with_markers}]}
    )
    print(response['structured_response'])


# def greet():
#     # Merging both greetings for a more inclusive message    
#     print("Hi there from HEAD and Heya from feature branch!")
#     def add(a, b):
#         return a + b
    
#     def multiply(a, b):
#         # Combining the print statement with the return for clarity
#         result = a * b
#         print(f"Multiplying numbers... Result is {result}")
#         return result
    
#     def divide(a, b):
#         if b == 0:
#             raise ValueError("Cannot divide by zero")
#         return a / b
#     # Utility function with timestamp
#     import datetime
#     def log(msg):
#         # Combining both logging styles for enhanced logging
#         print(f"[{datetime.datetime.now()}] [LOG]: {msg}")