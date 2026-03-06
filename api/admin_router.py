"""Admin endpoints for user management and app feature flags."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import ADMIN_USER_ID, ALL_APPS, get_current_user, get_user_features
from database import get_session
from models import List, PlantGroup, PlantGroupMember, User, UserAppAccess, UserInvite
from schemas import (
    AdminCreateUser,
    AdminUserResponse,
    FeatureUpdate,
    PlantGroupCreate,
    PlantGroupResponse,
    PlantGroupMemberResponse,
    PlantGroupUpdate,
    UserInviteResponse,
)

router = APIRouter(prefix="/admin", tags=["admin"])


async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency that verifies the current user is the admin."""
    if current_user.id != ADMIN_USER_ID:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/users", response_model=list[AdminUserResponse])
async def list_users(
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> list[AdminUserResponse]:
    """List all users with their feature flags. Admin-only."""
    result = await session.execute(select(User).order_by(User.id))
    users = result.scalars().all()
    out = []
    for u in users:
        features = await get_user_features(u.id, session)
        out.append(
            AdminUserResponse(
                id=u.id,
                email=u.email,
                name=u.name,
                picture=u.picture,
                is_admin=(u.id == ADMIN_USER_ID),
                features=features,
            )
        )
    return out


@router.get("/invites", response_model=list[UserInviteResponse])
async def list_invites(
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> list[UserInvite]:
    """List all pending email invites. Admin-only."""
    result = await session.execute(select(UserInvite).order_by(UserInvite.created_at))
    return list(result.scalars().all())


@router.post("/invites", response_model=UserInviteResponse, status_code=201)
async def create_invite(
    body: AdminCreateUser,
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> UserInvite:
    """Add an email to the invite list. Admin-only."""
    email = body.email.strip().lower()
    existing_user = await session.execute(select(User).where(User.email == email))
    if existing_user.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="User with this email already exists")
    existing_invite = await session.get(UserInvite, email)
    if existing_invite is not None:
        raise HTTPException(status_code=409, detail="Invite already exists for this email")
    invite = UserInvite(email=email)
    session.add(invite)
    await session.commit()
    await session.refresh(invite)
    return invite


@router.delete("/invites/{email}", status_code=204)
async def delete_invite(
    email: str,
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Remove a pending invite. Admin-only."""
    invite = await session.get(UserInvite, email.lower())
    if invite is None:
        raise HTTPException(status_code=404, detail="Invite not found")
    await session.delete(invite)
    await session.commit()


@router.put("/users/{user_id}/features", response_model=dict)
async def update_user_feature(
    user_id: int,
    body: FeatureUpdate,
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Upsert a feature flag for a user. Admin-only."""
    if body.app not in ALL_APPS:
        raise HTTPException(status_code=400, detail=f"Unknown app: {body.app}")

    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    result = await session.execute(
        select(UserAppAccess).where(
            UserAppAccess.user_id == user_id,
            UserAppAccess.app == body.app,
        )
    )
    access = result.scalar_one_or_none()
    if access is None:
        access = UserAppAccess(user_id=user_id, app=body.app, enabled=body.enabled)
        session.add(access)
    else:
        access.enabled = body.enabled
    await session.commit()
    return {"app": body.app, "enabled": body.enabled}


# ---------- Plant groups ----------


@router.get("/plant-groups", response_model=list[PlantGroupResponse])
async def list_plant_groups(
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> list[PlantGroupResponse]:
    """List all plant groups with their members. Admin-only."""
    from sqlalchemy.orm import selectinload
    result = await session.execute(
        select(PlantGroup)
        .options(selectinload(PlantGroup.members).selectinload(PlantGroupMember.user))
        .order_by(PlantGroup.id)
    )
    groups = result.scalars().all()
    return [
        PlantGroupResponse(
            id=g.id,
            name=g.name,
            members=[
                PlantGroupMemberResponse(user_id=m.user_id, name=m.user.name, email=m.user.email)
                for m in g.members
            ],
        )
        for g in groups
    ]


@router.post("/plant-groups", response_model=PlantGroupResponse, status_code=201)
async def create_plant_group(
    body: PlantGroupCreate,
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> PlantGroupResponse:
    """Create a new plant group and optionally assign users. Admin-only."""
    group = PlantGroup(name=body.name.strip())
    session.add(group)
    await session.flush()
    members = []
    for uid in body.user_ids:
        user = await session.get(User, uid)
        if user is None:
            continue
        # Ensure user is not already in another group
        existing = (await session.execute(
            select(PlantGroupMember).where(PlantGroupMember.user_id == uid)
        )).scalar_one_or_none()
        if existing is not None:
            continue
        m = PlantGroupMember(group_id=group.id, user_id=uid)
        session.add(m)
        members.append(PlantGroupMemberResponse(user_id=uid, name=user.name, email=user.email))
    await session.commit()
    return PlantGroupResponse(id=group.id, name=group.name, members=members)


@router.put("/plant-groups/{group_id}/members", response_model=PlantGroupResponse)
async def set_plant_group_members(
    group_id: int,
    body: PlantGroupUpdate,
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> PlantGroupResponse:
    """Replace plant group members with the given user ID list. Admin-only."""
    from sqlalchemy.orm import selectinload
    group = await session.get(PlantGroup, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")

    # Remove existing members
    old_members = (await session.execute(
        select(PlantGroupMember).where(PlantGroupMember.group_id == group_id)
    )).scalars().all()
    for m in old_members:
        await session.delete(m)
    await session.flush()

    # Add new members
    members = []
    for uid in body.user_ids:
        user = await session.get(User, uid)
        if user is None:
            continue
        m = PlantGroupMember(group_id=group_id, user_id=uid)
        session.add(m)
        members.append(PlantGroupMemberResponse(user_id=uid, name=user.name, email=user.email))

    await session.commit()
    return PlantGroupResponse(id=group_id, name=group.name, members=members)


@router.delete("/plant-groups/{group_id}", status_code=204)
async def delete_plant_group(
    group_id: int,
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a plant group (members become independent). Admin-only."""
    group = await session.get(PlantGroup, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    await session.delete(group)
    await session.commit()
