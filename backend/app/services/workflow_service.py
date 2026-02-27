from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
import uuid
from datetime import datetime

from ..models.workflow import Workflow
from ..schemas.workflow import WorkflowCreate, WorkflowUpdate


class WorkflowService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_workflow(self, workflow_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Workflow]:
        """Get workflow by ID (user-specific)."""
        result = await self.db.execute(
            select(Workflow).where(
                Workflow.id == workflow_id,
                Workflow.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def get_workflows(
        self,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20
    ) -> List[Workflow]:
        """Get all workflows for a user."""
        result = await self.db.execute(
            select(Workflow)
            .where(Workflow.user_id == user_id)
            .order_by(Workflow.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def count_workflows(self, user_id: uuid.UUID) -> int:
        """Count total workflows for a user."""
        from sqlalchemy import func
        result = await self.db.execute(
            select(func.count()).where(Workflow.user_id == user_id)
        )
        return result.scalar()

    async def create_workflow(
        self,
        user_id: uuid.UUID,
        workflow_data: WorkflowCreate
    ) -> Workflow:
        """Create a new workflow."""
        workflow = Workflow(
            user_id=user_id,
            name=workflow_data.name,
            description=workflow_data.description,
            definition=workflow_data.definition.model_dump(),
        )

        self.db.add(workflow)
        await self.db.commit()
        await self.db.refresh(workflow)

        return workflow

    async def update_workflow(
        self,
        workflow_id: uuid.UUID,
        user_id: uuid.UUID,
        workflow_data: WorkflowUpdate
    ) -> Optional[Workflow]:
        """Update a workflow."""
        workflow = await self.get_workflow(workflow_id, user_id)
        if not workflow:
            return None

        update_data = workflow_data.model_dump(exclude_unset=True)

        # Handle definition conversion
        if "definition" in update_data and update_data["definition"] is not None:
            update_data["definition"] = update_data["definition"].model_dump()

        for field, value in update_data.items():
            setattr(workflow, field, value)

        workflow.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(workflow)

        return workflow

    async def delete_workflow(self, workflow_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """Delete a workflow."""
        workflow = await self.get_workflow(workflow_id, user_id)
        if not workflow:
            return False

        await self.db.execute(
            delete(Workflow).where(Workflow.id == workflow_id)
        )
        await self.db.commit()

        return True

    async def update_last_executed(self, workflow_id: uuid.UUID) -> None:
        """Update the last_executed_at timestamp."""
        result = await self.db.execute(
            select(Workflow).where(Workflow.id == workflow_id)
        )
        workflow = result.scalar_one_or_none()
        if workflow:
            workflow.last_executed_at = datetime.utcnow()
            await self.db.commit()
