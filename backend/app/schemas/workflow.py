from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Any
from enum import Enum
import uuid


class NodeType(str, Enum):
    TRIGGER = "trigger"
    AGENT = "agent"
    HTTP_REQUEST = "http_request"
    CONDITION = "condition"
    TRANSFORM = "transform"
    OUTPUT = "output"


class WorkflowNode(BaseModel):
    id: str
    type: NodeType
    position: dict  # {x: number, y: number}
    data: dict  # Node-specific configuration

    class Config:
        extra = "allow"


class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class WorkflowDefinition(BaseModel):
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]

    class Config:
        extra = "allow"


class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    definition: WorkflowDefinition


class WorkflowCreate(WorkflowBase):
    pass


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    definition: Optional[WorkflowDefinition] = None
    is_active: Optional[bool] = None


class Workflow(WorkflowBase):
    id: uuid.UUID
    user_id: uuid.UUID
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_executed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
