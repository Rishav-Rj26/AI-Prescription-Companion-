from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_event import AuditEvent


async def record_audit_event(
    db: AsyncSession,
    *,
    event_name: str,
    actor_user_id: int | None = None,
    resource_type: str | None = None,
    resource_id: int | str | None = None,
    outcome: str = "success",
    metadata: dict[str, Any] | None = None,
) -> None:
    """Queue a minimal, non-PHI event in the request's transaction."""
    db.add(AuditEvent(
        actor_user_id=actor_user_id,
        event_name=event_name,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id is not None else None,
        outcome=outcome,
        metadata_json=metadata,
    ))
