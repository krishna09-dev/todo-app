from fastapi import APIRouter, HTTPException
from app.models.todo_model import Todo

router = APIRouter(prefix="/todos", tags=["Todos"])

DB: list[dict] = [
    {"id": 1, "title": "Learn Next.js", "completed": False, "priority": "Medium"},
    {"id": 2, "title": "Study FastAPI", "completed": False, "priority": "High"},
]

@router.get("/", response_model=list[Todo])
def list_todos():
    return DB

@router.post("/", response_model=Todo, status_code=201)
def create(todo: Todo):
    if any(t["id"] == todo.id for t in DB):
        raise HTTPException(409, "Todo with this id already exists")
    DB.insert(0, todo.dict())
    return todo

@router.put("/{todo_id}", response_model=Todo)
def update(todo_id: int, payload: Todo):
    for i, t in enumerate(DB):
        if t["id"] == todo_id:
            DB[i] = payload.dict()
            return DB[i]
    raise HTTPException(404, "Todo not found")

@router.patch("/{todo_id}/toggle", response_model=Todo)
def toggle(todo_id: int):
    for t in DB:
        if t["id"] == todo_id:
            t["completed"] = not t["completed"]
            return t
    raise HTTPException(404, "Todo not found")

@router.delete("/{todo_id}")
def delete(todo_id: int):
    global DB
    before = len(DB)
    DB = [t for t in DB if t["id"] != todo_id]
    if len(DB) == before:
        raise HTTPException(404, "Todo not found")
    return {"deleted": todo_id}