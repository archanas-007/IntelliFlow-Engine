from fastapi import APIRouter

from .auth import router as auth_router
from .workflows import router as workflows_router
from .executions import router as executions_router

api_router = APIRouter(prefix="/v1")

api_router.include_router(auth_router)
api_router.include_router(workflows_router)
api_router.include_router(executions_router)
