from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.security import get_current_user_id
from ...core.database import get_db
from ...schemas.execution import Execution, ExecutionCreate, NodeExecutionLog, ExecutionStatus
from ...services.execution_service import ExecutionService
from ...services.workflow_service import WorkflowService
import uuid

router = APIRouter(prefix="/executions", tags=["Executions"])


@router.get("", response_model=dict)
async def get_executions(
    workflow_id: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get executions for the current user, optionally filtered by workflow."""
    service = ExecutionService(db)
    skip = (page - 1) * page_size

    workflow_uuid = uuid.UUID(workflow_id) if workflow_id else None
    executions = await service.get_executions(uuid.UUID(user_id), workflow_uuid, skip, page_size)
    total = await service.count_executions(uuid.UUID(user_id), workflow_uuid)

    return {
        "items": [Execution.model_validate(e) for e in executions],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/{execution_id}", response_model=Execution)
async def get_execution(
    execution_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific execution by ID."""
    service = ExecutionService(db)
    execution = await service.get_execution(uuid.UUID(execution_id), uuid.UUID(user_id))

    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found",
        )

    return Execution.model_validate(execution)


@router.get("/{execution_id}/logs", response_model=list[NodeExecutionLog])
async def get_execution_logs(
    execution_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get all node logs for an execution."""
    service = ExecutionService(db)

    # First verify the execution belongs to the user
    execution = await service.get_execution(uuid.UUID(execution_id), uuid.UUID(user_id))
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found",
        )

    logs = await service.get_node_logs(uuid.UUID(execution_id))
    return [NodeExecutionLog.model_validate(log) for log in logs]


@router.post("", response_model=Execution, status_code=status.HTTP_201_CREATED)
async def create_execution(
    execution_data: ExecutionCreate,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create and start a new workflow execution."""
    execution_service = ExecutionService(db)
    workflow_service = WorkflowService(db)

    # Verify workflow exists and belongs to user
    workflow = await workflow_service.get_workflow(
        execution_data.workflow_id,
        uuid.UUID(user_id)
    )

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    # Create execution
    execution = await execution_service.create_execution(uuid.UUID(user_id), execution_data)

    # Update workflow's last_executed_at
    await workflow_service.update_last_executed(execution_data.workflow_id)

    # TODO: Start actual workflow execution in background
    # For now, we'll mark it as completed immediately
    background_tasks.add_task(
        execute_workflow_mock,
        str(execution.id),
        str(user_id),
        db
    )

    return Execution.model_validate(execution)


async def execute_workflow_mock(execution_id: str, user_id: str, db: AsyncSession):
    """Mock workflow execution - will be replaced with actual execution engine."""
    # This is a placeholder - will be replaced with actual execution logic
    from sqlalchemy.ext.asyncio import async_sessionmaker
    from ..core.database import async_session_maker

    async with async_session_maker() as session:
        service = ExecutionService(session)
        await service.update_execution_status(
            uuid.UUID(execution_id),
            ExecutionStatus.COMPLETED,
            output_data={"message": "Workflow executed successfully (mock)"}
        )


@router.post("/{execution_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_execution(
    execution_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a running execution."""
    service = ExecutionService(db)
    execution = await service.update_execution_status(
        uuid.UUID(execution_id),
        ExecutionStatus.CANCELLED
    )

    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found",
        )

    return {"message": "Execution cancelled"}
