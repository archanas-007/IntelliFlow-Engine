from sqlalchemy import Column, String, Boolean, DateTime, Text, func, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from ..core.database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    definition = Column(JSONB, nullable=False)  # Stores workflow graph (nodes, edges)
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_executed_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="workflows")
    executions = relationship("Execution", back_populates="workflow", cascade="all, delete-orphan")
