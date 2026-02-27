from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.security import create_access_token, get_current_user_id
from ...core.database import get_db
from ...schemas.user import User, UserCreate, UserLogin, Token
from ...services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user."""
    try:
        auth_service = AuthService(db)
        user = await auth_service.create_user(user_data)

        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})

        return Token(
            access_token=access_token,
            token_type="bearer",
            user=User.model_validate(user),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """Login with email and password."""
    auth_service = AuthService(db)
    user = await auth_service.authenticate_user(credentials.email, credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=User.model_validate(user),
    )


@router.get("/me", response_model=User)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get current user information."""
    auth_service = AuthService(db)
    user = await auth_service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return User.model_validate(user)


@router.post("/logout")
async def logout():
    """Logout endpoint (token deletion handled client-side)."""
    return {"message": "Successfully logged out"}
