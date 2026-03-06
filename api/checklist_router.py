"""Checklist module: packing list templates and trip sessions."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth import get_current_user
from database import get_session
from models import (
    ChecklistSession,
    ChecklistSessionItem,
    ChecklistSessionShare,
    ChecklistTemplate,
    ChecklistTemplateInclude,
    ChecklistTemplateItem,
    ChecklistTemplateShare,
    User,
)
from schemas import (
    ChecklistSessionCreate,
    ChecklistSessionItemAdd,
    ChecklistSessionItemResponse,
    ChecklistSessionResponse,
    ChecklistShareCreate,
    ChecklistShareResponse,
    ChecklistTemplateBatchShareCreate,
    ChecklistTemplateCreate,
    ChecklistTemplateIncludeResponse,
    ChecklistTemplateItemCreate,
    ChecklistTemplateItemResponse,
    ChecklistTemplateResponse,
    ChecklistTemplateUpdate,
)

router = APIRouter(prefix="/checklist", tags=["checklist"])


# ---------- Helpers ----------


def _share_response(s: ChecklistSessionShare | ChecklistTemplateShare) -> ChecklistShareResponse:
    template_id = getattr(s, "template_id", None)
    return ChecklistShareResponse(
        id=s.id,
        shared_with_user_id=s.shared_with_user_id,
        shared_with_name=s.shared_with.name,
        shared_with_email=s.shared_with.email,
        permission=s.permission,
        template_id=template_id,
    )


def _template_response(
    tmpl: ChecklistTemplate,
    permission: str = "owner",
    owner_id: int | None = None,
    owner_name: str | None = None,
    shares: list[ChecklistShareResponse] | None = None,
) -> ChecklistTemplateResponse:
    return ChecklistTemplateResponse(
        id=tmpl.id,
        name=tmpl.name,
        created_at=tmpl.created_at,
        items=[ChecklistTemplateItemResponse.model_validate(i) for i in tmpl.items],
        includes=[
            ChecklistTemplateIncludeResponse(id=inc.id, child_id=inc.child_id, child_name=inc.child.name)
            for inc in tmpl.includes
        ],
        permission=permission,
        owner_id=owner_id,
        owner_name=owner_name,
        shares=shares or [],
    )


def _session_response(
    sess: ChecklistSession,
    permission: str = "owner",
    owner_id: int | None = None,
    owner_name: str | None = None,
    shares: list[ChecklistShareResponse] | None = None,
) -> ChecklistSessionResponse:
    return ChecklistSessionResponse(
        id=sess.id,
        name=sess.name,
        created_at=sess.created_at,
        completed_at=sess.completed_at,
        items=[ChecklistSessionItemResponse.model_validate(i) for i in sess.items],
        permission=permission,
        owner_id=owner_id,
        owner_name=owner_name,
        shares=shares or [],
    )


async def _load_template(session: AsyncSession, template_id: int, user: User) -> ChecklistTemplate:
    """Load a template owned by the user (for owner-only operations)."""
    result = await session.execute(
        select(ChecklistTemplate)
        .options(
            selectinload(ChecklistTemplate.items),
            selectinload(ChecklistTemplate.includes).selectinload(ChecklistTemplateInclude.child),
        )
        .where(ChecklistTemplate.id == template_id, ChecklistTemplate.user_id == user.id)
    )
    tmpl = result.scalar_one_or_none()
    if tmpl is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return tmpl


async def _load_session_access(
    db: AsyncSession, session_id: int, user: User, require_write: bool = False
) -> tuple[ChecklistSession, str]:
    """Load a session and return (session, permission). Handles owner and shared access."""
    result = await db.execute(
        select(ChecklistSession)
        .options(
            selectinload(ChecklistSession.items),
            selectinload(ChecklistSession.shares).selectinload(ChecklistSessionShare.shared_with),
        )
        .where(ChecklistSession.id == session_id)
    )
    sess = result.scalar_one_or_none()
    if sess is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if sess.user_id == user.id:
        return sess, "owner"
    # Check share
    share_result = await db.execute(
        select(ChecklistSessionShare).where(
            ChecklistSessionShare.session_id == session_id,
            ChecklistSessionShare.shared_with_user_id == user.id,
        )
    )
    share = share_result.scalar_one_or_none()
    if share is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if require_write and share.permission != "write":
        raise HTTPException(status_code=403, detail="Write permission required")
    return sess, share.permission


async def _load_template_access(
    db: AsyncSession, template_id: int, user: User, require_write: bool = False
) -> tuple[ChecklistTemplate, str]:
    """Load a template and return (template, permission). Handles owner and shared access."""
    result = await db.execute(
        select(ChecklistTemplate)
        .options(
            selectinload(ChecklistTemplate.items),
            selectinload(ChecklistTemplate.includes).selectinload(ChecklistTemplateInclude.child),
            selectinload(ChecklistTemplate.shares).selectinload(ChecklistTemplateShare.shared_with),
        )
        .where(ChecklistTemplate.id == template_id)
    )
    tmpl = result.scalar_one_or_none()
    if tmpl is None:
        raise HTTPException(status_code=404, detail="Template not found")
    if tmpl.user_id == user.id:
        return tmpl, "owner"
    # Check share
    share_result = await db.execute(
        select(ChecklistTemplateShare).where(
            ChecklistTemplateShare.template_id == template_id,
            ChecklistTemplateShare.shared_with_user_id == user.id,
        )
    )
    share = share_result.scalar_one_or_none()
    if share is None:
        raise HTTPException(status_code=404, detail="Template not found")
    if require_write and share.permission != "write":
        raise HTTPException(status_code=403, detail="Write permission required")
    return tmpl, share.permission


async def _flatten_template(
    session: AsyncSession,
    template_id: int,
    user_id: int,
    visited: set[int] | None = None,
    _owner_id: int | None = None,
) -> list[tuple[int, str, str]]:
    """Recursively flatten a template into (template_id, template_name, item_text) tuples.

    At the top level (_owner_id is None) the template may be owned or shared with user_id.
    For recursive includes, _owner_id is set to the template's actual owner so includes are
    resolved in the owner's namespace.
    """
    if visited is None:
        visited = set()
    if template_id in visited:
        return []
    visited.add(template_id)

    if _owner_id is not None:
        # Recursing into sub-templates owned by the original template's owner
        result = await session.execute(
            select(ChecklistTemplate)
            .options(
                selectinload(ChecklistTemplate.items),
                selectinload(ChecklistTemplate.includes).selectinload(ChecklistTemplateInclude.child),
            )
            .where(ChecklistTemplate.id == template_id, ChecklistTemplate.user_id == _owner_id)
        )
    else:
        # Top-level call: owned by user OR shared with user
        result = await session.execute(
            select(ChecklistTemplate)
            .options(
                selectinload(ChecklistTemplate.items),
                selectinload(ChecklistTemplate.includes).selectinload(ChecklistTemplateInclude.child),
            )
            .where(
                ChecklistTemplate.id == template_id,
                or_(
                    ChecklistTemplate.user_id == user_id,
                    ChecklistTemplate.id.in_(
                        select(ChecklistTemplateShare.template_id).where(
                            ChecklistTemplateShare.shared_with_user_id == user_id
                        )
                    ),
                ),
            )
        )

    tmpl = result.scalar_one_or_none()
    if tmpl is None:
        return []

    owner_id = tmpl.user_id
    rows: list[tuple[int, str, str]] = []

    # First recurse into sub-templates in order
    for inc in sorted(tmpl.includes, key=lambda i: i.position):
        rows.extend(
            await _flatten_template(session, inc.child_id, user_id, visited, _owner_id=owner_id)
        )

    # Then own items
    for item in sorted(tmpl.items, key=lambda i: i.position):
        rows.append((tmpl.id, tmpl.name, item.text))

    return rows


# ---------- Templates ----------

# NOTE: /templates/shares and /templates/shares/batch are registered BEFORE /{template_id}
# to avoid FastAPI treating "shares" as a template_id.


@router.get("/templates/shares", response_model=list[ChecklistShareResponse])
async def list_template_shares(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ChecklistShareResponse]:
    """List all outgoing template shares for the current user (flat)."""
    result = await session.execute(
        select(ChecklistTemplateShare)
        .join(ChecklistTemplate, ChecklistTemplate.id == ChecklistTemplateShare.template_id)
        .options(selectinload(ChecklistTemplateShare.shared_with))
        .where(ChecklistTemplate.user_id == current_user.id)
        .order_by(ChecklistTemplateShare.created_at)
    )
    return [_share_response(s) for s in result.scalars().all()]


@router.post("/templates/shares/batch", response_model=list[ChecklistShareResponse], status_code=201)
async def batch_share_templates(
    body: ChecklistTemplateBatchShareCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ChecklistShareResponse]:
    """Share multiple templates with a user by email (upserts if already shared)."""
    target_result = await session.execute(
        select(User).where(User.email == body.email)
    )
    target = target_result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot share with yourself")

    created: list[ChecklistShareResponse] = []
    for tmpl_id in body.template_ids:
        # Verify ownership
        tmpl = await session.get(ChecklistTemplate, tmpl_id)
        if tmpl is None or tmpl.user_id != current_user.id:
            continue
        # Upsert
        existing_result = await session.execute(
            select(ChecklistTemplateShare).where(
                ChecklistTemplateShare.template_id == tmpl_id,
                ChecklistTemplateShare.shared_with_user_id == target.id,
            )
        )
        existing = existing_result.scalar_one_or_none()
        if existing:
            existing.permission = body.permission
            await session.flush()
            share = existing
        else:
            share = ChecklistTemplateShare(
                template_id=tmpl_id,
                shared_with_user_id=target.id,
                permission=body.permission,
            )
            session.add(share)
            await session.flush()

        created.append(ChecklistShareResponse(
            id=share.id,
            shared_with_user_id=target.id,
            shared_with_name=target.name,
            shared_with_email=target.email,
            permission=body.permission,
        ))

    await session.commit()
    return created


@router.get("/templates", response_model=list[ChecklistTemplateResponse])
async def list_templates(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ChecklistTemplateResponse]:
    """List all checklist templates for the current user (owned + shared)."""
    # Owned templates
    owned_result = await session.execute(
        select(ChecklistTemplate)
        .options(
            selectinload(ChecklistTemplate.items),
            selectinload(ChecklistTemplate.includes).selectinload(ChecklistTemplateInclude.child),
            selectinload(ChecklistTemplate.shares).selectinload(ChecklistTemplateShare.shared_with),
        )
        .where(ChecklistTemplate.user_id == current_user.id)
        .order_by(ChecklistTemplate.name)
    )
    owned = list(owned_result.scalars().all())

    # Shared template IDs
    shared_ids_result = await session.execute(
        select(ChecklistTemplateShare.template_id).where(
            ChecklistTemplateShare.shared_with_user_id == current_user.id
        )
    )
    shared_ids = [row[0] for row in shared_ids_result.all()]

    shared_result = await session.execute(
        select(ChecklistTemplate)
        .options(
            selectinload(ChecklistTemplate.items),
            selectinload(ChecklistTemplate.includes).selectinload(ChecklistTemplateInclude.child),
        )
        .where(ChecklistTemplate.id.in_(shared_ids))
        .order_by(ChecklistTemplate.name)
    )
    shared = list(shared_result.scalars().all())

    responses: list[ChecklistTemplateResponse] = []
    for tmpl in owned:
        share_responses = [_share_response(s) for s in tmpl.shares]
        responses.append(_template_response(tmpl, permission="owner", shares=share_responses))

    for tmpl in shared:
        share_result = await session.execute(
            select(ChecklistTemplateShare).where(
                ChecklistTemplateShare.template_id == tmpl.id,
                ChecklistTemplateShare.shared_with_user_id == current_user.id,
            )
        )
        share = share_result.scalar_one_or_none()
        perm = share.permission if share else "read"
        owner = await session.get(User, tmpl.user_id)
        responses.append(
            _template_response(
                tmpl,
                permission=perm,
                owner_id=tmpl.user_id,
                owner_name=owner.name if owner else None,
            )
        )

    return responses


@router.post("/templates", response_model=ChecklistTemplateResponse, status_code=201)
async def create_template(
    body: ChecklistTemplateCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ChecklistTemplateResponse:
    """Create a new checklist template."""
    tmpl = ChecklistTemplate(user_id=current_user.id, name=body.name.strip())
    session.add(tmpl)
    await session.commit()
    tmpl = await _load_template(session, tmpl.id, current_user)
    return _template_response(tmpl)


@router.put("/templates/{template_id}", response_model=ChecklistTemplateResponse)
async def update_template(
    template_id: int,
    body: ChecklistTemplateUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ChecklistTemplateResponse:
    """Rename a checklist template (owner only)."""
    tmpl, permission = await _load_template_access(session, template_id, current_user, require_write=True)
    if permission != "owner":
        raise HTTPException(status_code=403, detail="Only the owner can rename this template")
    tmpl.name = body.name.strip()
    await session.commit()
    tmpl, _ = await _load_template_access(session, template_id, current_user)
    return _template_response(tmpl)


@router.delete("/templates/{template_id}", status_code=204)
async def delete_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a checklist template (owner only)."""
    tmpl = await _load_template(session, template_id, current_user)
    await session.delete(tmpl)
    await session.commit()


# ---------- Template items ----------


@router.post("/templates/{template_id}/items", response_model=ChecklistTemplateItemResponse, status_code=201)
async def add_template_item(
    template_id: int,
    body: ChecklistTemplateItemCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ChecklistTemplateItemResponse:
    """Add an item to a template (write access required)."""
    tmpl, _ = await _load_template_access(session, template_id, current_user, require_write=True)
    position = len(tmpl.items)
    item = ChecklistTemplateItem(template_id=template_id, text=body.text.strip(), position=position)
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return ChecklistTemplateItemResponse.model_validate(item)


@router.delete("/templates/{template_id}/items/{item_id}", status_code=204)
async def delete_template_item(
    template_id: int,
    item_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete an item from a template (write access required)."""
    await _load_template_access(session, template_id, current_user, require_write=True)
    item = await session.get(ChecklistTemplateItem, item_id)
    if item is None or item.template_id != template_id:
        raise HTTPException(status_code=404, detail="Item not found")
    await session.delete(item)
    await session.commit()


# ---------- Template includes (sub-templates) ----------


@router.post("/templates/{template_id}/includes/{child_id}", response_model=ChecklistTemplateIncludeResponse, status_code=201)
async def add_template_include(
    template_id: int,
    child_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ChecklistTemplateIncludeResponse:
    """Include a sub-template in a template (owner only)."""
    if template_id == child_id:
        raise HTTPException(status_code=400, detail="A template cannot include itself")
    parent = await _load_template(session, template_id, current_user)
    child = await _load_template(session, child_id, current_user)

    existing = await session.execute(
        select(ChecklistTemplateInclude).where(
            ChecklistTemplateInclude.parent_id == template_id,
            ChecklistTemplateInclude.child_id == child_id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Already included")

    inc = ChecklistTemplateInclude(
        parent_id=template_id,
        child_id=child_id,
        position=len(parent.includes),
    )
    session.add(inc)
    await session.commit()
    await session.refresh(inc)
    return ChecklistTemplateIncludeResponse(id=inc.id, child_id=child_id, child_name=child.name)


@router.delete("/templates/{template_id}/includes/{include_id}", status_code=204)
async def remove_template_include(
    template_id: int,
    include_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Remove a sub-template from a template (owner only)."""
    await _load_template(session, template_id, current_user)
    inc = await session.get(ChecklistTemplateInclude, include_id)
    if inc is None or inc.parent_id != template_id:
        raise HTTPException(status_code=404, detail="Include not found")
    await session.delete(inc)
    await session.commit()


# ---------- Template shares ----------


@router.get("/templates/{template_id}/shares", response_model=list[ChecklistShareResponse])
async def get_template_shares(
    template_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ChecklistShareResponse]:
    """List shares for a template (owner only)."""
    tmpl = await _load_template(session, template_id, current_user)
    result = await session.execute(
        select(ChecklistTemplateShare)
        .options(selectinload(ChecklistTemplateShare.shared_with))
        .where(ChecklistTemplateShare.template_id == tmpl.id)
    )
    return [_share_response(s) for s in result.scalars().all()]


@router.delete("/templates/{template_id}/shares/{share_id}", status_code=204)
async def delete_template_share(
    template_id: int,
    share_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Remove a template share (owner only)."""
    await _load_template(session, template_id, current_user)
    share = await session.get(ChecklistTemplateShare, share_id)
    if share is None or share.template_id != template_id:
        raise HTTPException(status_code=404, detail="Share not found")
    await session.delete(share)
    await session.commit()


# ---------- Sessions ----------


@router.get("/sessions", response_model=list[ChecklistSessionResponse])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ChecklistSessionResponse]:
    """List all sessions (owned + shared). Active first, then completed."""
    # Owned sessions
    owned_result = await session.execute(
        select(ChecklistSession)
        .options(
            selectinload(ChecklistSession.items),
            selectinload(ChecklistSession.shares).selectinload(ChecklistSessionShare.shared_with),
        )
        .where(ChecklistSession.user_id == current_user.id)
        .order_by(ChecklistSession.completed_at.nulls_first(), ChecklistSession.created_at.desc())
    )
    owned = list(owned_result.scalars().all())

    # Shared session IDs
    shared_ids_result = await session.execute(
        select(ChecklistSessionShare.session_id).where(
            ChecklistSessionShare.shared_with_user_id == current_user.id
        )
    )
    shared_ids = [row[0] for row in shared_ids_result.all()]

    shared_result = await session.execute(
        select(ChecklistSession)
        .options(selectinload(ChecklistSession.items))
        .where(ChecklistSession.id.in_(shared_ids))
        .order_by(ChecklistSession.completed_at.nulls_first(), ChecklistSession.created_at.desc())
    )
    shared = list(shared_result.scalars().all())

    responses: list[ChecklistSessionResponse] = []
    for sess in owned:
        share_responses = [_share_response(s) for s in sess.shares]
        responses.append(_session_response(sess, permission="owner", shares=share_responses))

    for sess in shared:
        share_result = await session.execute(
            select(ChecklistSessionShare).where(
                ChecklistSessionShare.session_id == sess.id,
                ChecklistSessionShare.shared_with_user_id == current_user.id,
            )
        )
        share = share_result.scalar_one_or_none()
        perm = share.permission if share else "read"
        owner = await session.get(User, sess.user_id)
        responses.append(
            _session_response(
                sess,
                permission=perm,
                owner_id=sess.user_id,
                owner_name=owner.name if owner else None,
            )
        )

    return responses


@router.post("/sessions", response_model=ChecklistSessionResponse, status_code=201)
async def create_session(
    body: ChecklistSessionCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ChecklistSessionResponse:
    """Create a new packing session by flattening selected templates."""
    sess = ChecklistSession(user_id=current_user.id, name=body.name.strip())
    session.add(sess)
    await session.flush()

    position = 0
    seen_items: set[str] = set()
    for tmpl_id in body.template_ids:
        rows = await _flatten_template(session, tmpl_id, current_user.id)
        for (src_tmpl_id, src_tmpl_name, text) in rows:
            key = f"{src_tmpl_id}:{text.lower()}"
            if key in seen_items:
                continue
            seen_items.add(key)
            item = ChecklistSessionItem(
                session_id=sess.id,
                text=text,
                template_id=src_tmpl_id,
                template_name=src_tmpl_name,
                position=position,
            )
            session.add(item)
            position += 1

    await session.commit()

    result = await session.execute(
        select(ChecklistSession)
        .options(selectinload(ChecklistSession.items))
        .where(ChecklistSession.id == sess.id)
    )
    return _session_response(result.scalar_one())


@router.get("/sessions/{session_id}", response_model=ChecklistSessionResponse)
async def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ChecklistSessionResponse:
    """Get a single packing session with all items."""
    sess, permission = await _load_session_access(session, session_id, current_user)
    if permission == "owner":
        return _session_response(sess, permission="owner", shares=[_share_response(s) for s in sess.shares])
    owner = await session.get(User, sess.user_id)
    return _session_response(
        sess,
        permission=permission,
        owner_id=sess.user_id,
        owner_name=owner.name if owner else None,
    )


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a packing session (owner only)."""
    result = await session.execute(
        select(ChecklistSession).where(
            ChecklistSession.id == session_id, ChecklistSession.user_id == current_user.id
        )
    )
    sess = result.scalar_one_or_none()
    if sess is None:
        raise HTTPException(status_code=404, detail="Session not found")
    await session.delete(sess)
    await session.commit()


@router.post("/sessions/{session_id}/complete", response_model=ChecklistSessionResponse)
async def complete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ChecklistSessionResponse:
    """Mark a session as completed or reopen it (write access required)."""
    from datetime import datetime, timezone

    sess, permission = await _load_session_access(session, session_id, current_user, require_write=True)
    sess.completed_at = None if sess.completed_at else datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(sess)
    if permission == "owner":
        return _session_response(sess, permission="owner", shares=[_share_response(s) for s in sess.shares])
    owner = await session.get(User, sess.user_id)
    return _session_response(
        sess,
        permission=permission,
        owner_id=sess.user_id,
        owner_name=owner.name if owner else None,
    )


@router.patch("/sessions/{session_id}/items/{item_id}", response_model=ChecklistSessionItemResponse)
async def toggle_session_item(
    session_id: int,
    item_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ChecklistSessionItemResponse:
    """Toggle a session item checked/unchecked (write access required)."""
    await _load_session_access(session, session_id, current_user, require_write=True)
    item = await session.get(ChecklistSessionItem, item_id)
    if item is None or item.session_id != session_id:
        raise HTTPException(status_code=404, detail="Item not found")
    item.checked = not item.checked
    await session.commit()
    await session.refresh(item)
    return ChecklistSessionItemResponse.model_validate(item)


@router.post("/sessions/{session_id}/items", response_model=ChecklistSessionItemResponse, status_code=201)
async def add_session_item(
    session_id: int,
    body: ChecklistSessionItemAdd,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ChecklistSessionItemResponse:
    """Add an ad-hoc item to an active session (write access required)."""
    sess, _ = await _load_session_access(session, session_id, current_user, require_write=True)
    item = ChecklistSessionItem(
        session_id=session_id,
        text=body.text.strip(),
        template_name=body.template_name,
        position=len(sess.items),
    )
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return ChecklistSessionItemResponse.model_validate(item)


# ---------- Session shares ----------


@router.get("/sessions/{session_id}/shares", response_model=list[ChecklistShareResponse])
async def get_session_shares(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ChecklistShareResponse]:
    """List shares for a session (owner only)."""
    sess, permission = await _load_session_access(session, session_id, current_user)
    if permission != "owner":
        raise HTTPException(status_code=403, detail="Only the owner can view shares")
    result = await session.execute(
        select(ChecklistSessionShare)
        .options(selectinload(ChecklistSessionShare.shared_with))
        .where(ChecklistSessionShare.session_id == sess.id)
    )
    return [_share_response(s) for s in result.scalars().all()]


@router.post("/sessions/{session_id}/shares", response_model=ChecklistShareResponse, status_code=201)
async def create_session_share(
    session_id: int,
    body: ChecklistShareCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ChecklistShareResponse:
    """Share a session with another user by email (owner only)."""
    sess, permission = await _load_session_access(session, session_id, current_user)
    if permission != "owner":
        raise HTTPException(status_code=403, detail="Only the owner can share this session")

    target_result = await session.execute(select(User).where(User.email == body.email))
    target = target_result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot share with yourself")

    existing_result = await session.execute(
        select(ChecklistSessionShare).where(
            ChecklistSessionShare.session_id == session_id,
            ChecklistSessionShare.shared_with_user_id == target.id,
        )
    )
    if existing_result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Already shared with this user")

    share = ChecklistSessionShare(
        session_id=session_id,
        shared_with_user_id=target.id,
        permission=body.permission,
    )
    session.add(share)
    await session.commit()
    await session.refresh(share)
    return ChecklistShareResponse(
        id=share.id,
        shared_with_user_id=target.id,
        shared_with_name=target.name,
        shared_with_email=target.email,
        permission=share.permission,
    )


@router.delete("/sessions/{session_id}/shares/{share_id}", status_code=204)
async def delete_session_share(
    session_id: int,
    share_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Remove a session share (owner only)."""
    _, permission = await _load_session_access(session, session_id, current_user)
    if permission != "owner":
        raise HTTPException(status_code=403, detail="Only the owner can remove shares")
    share = await session.get(ChecklistSessionShare, share_id)
    if share is None or share.session_id != session_id:
        raise HTTPException(status_code=404, detail="Share not found")
    await session.delete(share)
    await session.commit()
