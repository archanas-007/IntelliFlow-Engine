from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.security import get_current_user_id
from ...core.database import get_db
from ...schemas.workflow import Workflow, WorkflowCreate, WorkflowUpdate
from ...services.workflow_service import WorkflowService
import uuid

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.get("", response_model=dict)
async def get_workflows(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get all workflows for the current user."""
    service = WorkflowService(db)
    skip = (page - 1) * page_size

    workflows = await service.get_workflows(uuid.UUID(user_id), skip, page_size)
    total = await service.count_workflows(uuid.UUID(user_id))

    return {
        "items": [Workflow.model_validate(w) for w in workflows],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(
    workflow_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific workflow by ID."""
    service = WorkflowService(db)
    workflow = await service.get_workflow(uuid.UUID(workflow_id), uuid.UUID(user_id))

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    return Workflow.model_validate(workflow)


@router.post("", response_model=Workflow, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow_data: WorkflowCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new workflow."""
    service = WorkflowService(db)
    workflow = await service.create_workflow(uuid.UUID(user_id), workflow_data)
    return Workflow.model_validate(workflow)


@router.put("/{workflow_id}", response_model=Workflow)
async def update_workflow(
    workflow_id: str,
    workflow_data: WorkflowUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update a workflow."""
    service = WorkflowService(db)
    workflow = await service.update_workflow(
        uuid.UUID(workflow_id),
        uuid.UUID(user_id),
        workflow_data
    )

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    return Workflow.model_validate(workflow)


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a workflow."""
    service = WorkflowService(db)
    success = await service.delete_workflow(uuid.UUID(workflow_id), uuid.UUID(user_id))

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )
