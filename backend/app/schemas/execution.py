from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum
import uuid


class ExecutionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ExecutionBase(BaseModel):
    workflow_id: uuid.UUID
    input_data: Optional[Dict[str, Any]] = None


class ExecutionCreate(ExecutionBase):
    pass


class Execution(ExecutionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    status: ExecutionStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class NodeExecutionLogBase(BaseModel):
    node_id: str
    node_type: str
    status: ExecutionStatus


class NodeExecutionLog(NodeExecutionLogBase):
    id: uuid.UUID
    execution_id: uuid.UUID
    started_at: datetime
    completed_at: Optional[datetime] = None
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    tokens_used: Optional[int] = None

    class Config:
        from_attributes = True
