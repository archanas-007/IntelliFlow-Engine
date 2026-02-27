from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
from datetime import datetime
from asyncio import create_task

from ..models.execution import Execution, NodeExecutionLog, ExecutionStatus
from ..schemas.execution import ExecutionCreate


class ExecutionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_execution(self, execution_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Execution]:
        """Get execution by ID (user-specific)."""
        result = await self.db.execute(
            select(Execution).where(
                Execution.id == execution_id,
                Execution.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def get_executions(
        self,
        user_id: uuid.UUID,
        workflow_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[Execution]:
        """Get executions for a user, optionally filtered by workflow."""
        query = select(Execution).where(Execution.user_id == user_id)

        if workflow_id:
            query = query.where(Execution.workflow_id == workflow_id)

        query = query.order_by(Execution.started_at.desc()).offset(skip).limit(limit)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def count_executions(
        self,
        user_id: uuid.UUID,
        workflow_id: Optional[uuid.UUID] = None
    ) -> int:
        """Count executions for a user."""
        from sqlalchemy import func
        query = select(func.count()).where(Execution.user_id == user_id)

        if workflow_id:
            query = query.where(Execution.workflow_id == workflow_id)

        result = await self.db.execute(query)
        return result.scalar()

    async def create_execution(
        self,
        user_id: uuid.UUID,
        execution_data: ExecutionCreate
    ) -> Execution:
        """Create a new execution."""
        execution = Execution(
            user_id=user_id,
            workflow_id=execution_data.workflow_id,
            input_data=execution_data.input_data,
            status=ExecutionStatus.PENDING,
        )

        self.db.add(execution)
        await self.db.commit()
        await self.db.refresh(execution)

        return execution

    async def update_execution_status(
        self,
        execution_id: uuid.UUID,
        status: ExecutionStatus,
        output_data: Optional[dict] = None,
        error_message: Optional[str] = None
    ) -> Optional[Execution]:
        """Update execution status."""
        result = await self.db.execute(
            select(Execution).where(Execution.id == execution_id)
        )
        execution = result.scalar_one_or_none()

        if not execution:
            return None

        execution.status = status

        if status == ExecutionStatus.COMPLETED:
            execution.completed_at = datetime.utcnow()
            if execution.started_at:
                duration = (execution.completed_at - execution.started_at).total_seconds()
                execution.duration_seconds = int(duration)

        if output_data:
            execution.output_data = output_data

        if error_message:
            execution.error_message = error_message

        await self.db.commit()
        await self.db.refresh(execution)

        return execution

    async def create_node_log(
        self,
        execution_id: uuid.UUID,
        node_id: str,
        node_type: str,
        status: ExecutionStatus,
        input_data: Optional[dict] = None,
        output_data: Optional[dict] = None,
        error_message: Optional[str] = None
    ) -> NodeExecutionLog:
        """Create a node execution log."""
        log = NodeExecutionLog(
            execution_id=execution_id,
            node_id=node_id,
            node_type=node_type,
            status=status,
            input_data=input_data,
            output_data=output_data,
            error_message=error_message,
        )

        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)

        return log

    async def update_node_log(
        self,
        log_id: uuid.UUID,
        status: ExecutionStatus,
        output_data: Optional[dict] = None,
        error_message: Optional[str] = None
    ) -> Optional[NodeExecutionLog]:
        """Update a node execution log."""
        result = await self.db.execute(
            select(NodeExecutionLog).where(NodeExecutionLog.id == log_id)
        )
        log = result.scalar_one_or_none()

        if not log:
            return None

        log.status = status
        log.completed_at = datetime.utcnow()

        if output_data:
            log.output_data = output_data

        if error_message:
            log.error_message = error_message

        await self.db.commit()
        await self.db.refresh(log)

        return log

    async def get_node_logs(self, execution_id: uuid.UUID) -> List[NodeExecutionLog]:
        """Get all node logs for an execution."""
        result = await self.db.execute(
            select(NodeExecutionLog)
            .where(NodeExecutionLog.execution_id == execution_id)
            .order_by(NodeExecutionLog.started_at)
        )
        return result.scalars().all()
