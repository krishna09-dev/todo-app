from pydantic import BaseModel, Field
from typing import Literal

Priority = Literal["High", "Medium", "Low"]

class Todo(BaseModel):
    id: int = Field(..., description="Client-generated id (Date.now())")
    title: str
    completed: bool = False
    priority: Priority = "Low"