from sqlalchemy import Column, String, Integer, DateTime, Text, func, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
import enum

from ..core.database import Base


class ExecutionStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Execution(Base):
    __tablename__ = "executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    status = Column(SQLEnum(ExecutionStatus), nullable=False, default=ExecutionStatus.PENDING, index=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    completed_at = Column(DateTime(timezone=True))
    duration_seconds = Column(Integer)
    input_data = Column(JSONB)
    output_data = Column(JSONB)
    error_message = Column(Text)
    execution_metadata = Column(JSONB)

    # Relationships
    workflow = relationship("Workflow", back_populates="executions")
    user = relationship("User", back_populates="executions")
    node_logs = relationship("NodeExecutionLog", back_populates="execution", cascade="all, delete-orphan")


class NodeExecutionLog(Base):
    __tablename__ = "node_execution_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("executions.id"), nullable=False, index=True)
    node_id = Column(String(255), nullable=False, index=True)
    node_type = Column(String(100), nullable=False)
    status = Column(SQLEnum(ExecutionStatus), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    input_data = Column(JSONB)
    output_data = Column(JSONB)
    error_message = Column(Text)
    tokens_used = Column(Integer)

    # Relationships
    execution = relationship("Execution", back_populates="node_logs")
