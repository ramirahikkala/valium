"""Checklist module: packing list templates and trip sessions."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth import get_current_user
from database import get_session
from models import (
    ChecklistSession,
    ChecklistSessionItem,
    ChecklistTemplate,
    ChecklistTemplateInclude,
    ChecklistTemplateItem,
    User,
)
from schemas import (
    ChecklistSessionCreate,
    ChecklistSessionItemAdd,
    ChecklistSessionItemResponse,
    ChecklistSessionResponse,
    ChecklistTemplateCreate,
    ChecklistTemplateIncludeResponse,
    ChecklistTemplateItemCreate,
    ChecklistTemplateItemResponse,
    ChecklistTemplateResponse,
    ChecklistTemplateUpdate,
)

router = APIRouter(prefix="/checklist", tags=["checklist"])


# ---------- Helpers ----------


def _template_response(tmpl: ChecklistTemplate) -> ChecklistTemplateResponse:
    return ChecklistTemplateResponse(
        id=tmpl.id,
        name=tmpl.name,
        created_at=tmpl.created_at,
        items=[ChecklistTemplateItemResponse.model_validate(i) for i in tmpl.items],
        includes=[
            ChecklistTemplateIncludeResponse(id=inc.id, child_id=inc.child_id, child_name=inc.child.name)
            for inc in tmpl.includes
        ],
    )


async def _load_template(session: AsyncSession, template_id: int, user: User) -> ChecklistTemplate:
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


async def _flatten_template(
    session: AsyncSession,
    template_id: int,
    user_id: int,
    visited: set[int] | None = None,
) -> list[tuple[int, str, str]]:
    """Recursively flatten a template into (template_id, template_name, item_text) tuples."""
    if visited is None:
        visited = set()
    if template_id in visited:
        return []
    visited.add(template_id)

    result = await session.execute(
        select(ChecklistTemplate)
        .options(
            selectinload(ChecklistTemplate.items),
            selectinload(ChecklistTemplate.includes).selectinload(ChecklistTemplateInclude.child),
        )
        .where(ChecklistTemplate.id == template_id, ChecklistTemplate.user_id == user_id)
    )
    tmpl = result.scalar_one_or_none()
    if tmpl is None:
        return []

    rows: list[tuple[int, str, str]] = []

    # First recurse into sub-templates in order
    for inc in sorted(tmpl.includes, key=lambda i: i.position):
        rows.extend(
            await _flatten_template(session, inc.child_id, user_id, visited)
        )

    # Then own items
    for item in sorted(tmpl.items, key=lambda i: i.position):
        rows.append((tmpl.id, tmpl.name, item.text))

    return rows


# ---------- Templates ----------


@router.get("/templates", response_model=list[ChecklistTemplateResponse])
async def list_templates(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ChecklistTemplateResponse]:
    """List all checklist templates for the current user."""
    result = await session.execute(
        select(ChecklistTemplate)
        .options(
            selectinload(ChecklistTemplate.items),
            selectinload(ChecklistTemplate.includes).selectinload(ChecklistTemplateInclude.child),
        )
        .where(ChecklistTemplate.user_id == current_user.id)
        .order_by(ChecklistTemplate.name)
    )
    return [_template_response(t) for t in result.scalars().all()]


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
    """Rename a checklist template."""
    tmpl = await _load_template(session, template_id, current_user)
    tmpl.name = body.name.strip()
    await session.commit()
    tmpl = await _load_template(session, template_id, current_user)
    return _template_response(tmpl)


@router.delete("/templates/{template_id}", status_code=204)
async def delete_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a checklist template."""
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
    """Add an item to a template."""
    tmpl = await _load_template(session, template_id, current_user)
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
    """Delete an item from a template."""
    await _load_template(session, template_id, current_user)
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
    """Include a sub-template in a template."""
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
    """Remove a sub-template from a template."""
    await _load_template(session, template_id, current_user)
    inc = await session.get(ChecklistTemplateInclude, include_id)
    if inc is None or inc.parent_id != template_id:
        raise HTTPException(status_code=404, detail="Include not found")
    await session.delete(inc)
    await session.commit()


# ---------- Sessions ----------


@router.get("/sessions", response_model=list[ChecklistSessionResponse])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ChecklistSessionResponse]:
    """List all sessions (active first, then completed)."""
    result = await session.execute(
        select(ChecklistSession)
        .options(selectinload(ChecklistSession.items))
        .where(ChecklistSession.user_id == current_user.id)
        .order_by(ChecklistSession.completed_at.nulls_first(), ChecklistSession.created_at.desc())
    )
    sessions = result.scalars().all()
    return [ChecklistSessionResponse.model_validate(s) for s in sessions]


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
    return ChecklistSessionResponse.model_validate(result.scalar_one())


@router.get("/sessions/{session_id}", response_model=ChecklistSessionResponse)
async def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ChecklistSessionResponse:
    """Get a single packing session with all items."""
    result = await session.execute(
        select(ChecklistSession)
        .options(selectinload(ChecklistSession.items))
        .where(ChecklistSession.id == session_id, ChecklistSession.user_id == current_user.id)
    )
    sess = result.scalar_one_or_none()
    if sess is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return ChecklistSessionResponse.model_validate(sess)


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a packing session."""
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
    """Mark a session as completed (or reopen if already completed)."""
    from datetime import datetime, timezone

    result = await session.execute(
        select(ChecklistSession)
        .options(selectinload(ChecklistSession.items))
        .where(ChecklistSession.id == session_id, ChecklistSession.user_id == current_user.id)
    )
    sess = result.scalar_one_or_none()
    if sess is None:
        raise HTTPException(status_code=404, detail="Session not found")
    sess.completed_at = None if sess.completed_at else datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(sess)
    return ChecklistSessionResponse.model_validate(sess)


@router.patch("/sessions/{session_id}/items/{item_id}", response_model=ChecklistSessionItemResponse)
async def toggle_session_item(
    session_id: int,
    item_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ChecklistSessionItemResponse:
    """Toggle a session item checked/unchecked."""
    result = await session.execute(
        select(ChecklistSession).where(
            ChecklistSession.id == session_id, ChecklistSession.user_id == current_user.id
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Session not found")
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
    """Add an ad-hoc item to an active session."""
    result = await session.execute(
        select(ChecklistSession)
        .options(selectinload(ChecklistSession.items))
        .where(ChecklistSession.id == session_id, ChecklistSession.user_id == current_user.id)
    )
    sess = result.scalar_one_or_none()
    if sess is None:
        raise HTTPException(status_code=404, detail="Session not found")
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
