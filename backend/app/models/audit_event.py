from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.sql import func

from app.db.base import Base


class AuditEvent(Base):
    """Non-PHI event trail for sensitive account and record actions."""

    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    event_name = Column(String(80), nullable=False, index=True)
    resource_type = Column(String(80), nullable=True)
    resource_id = Column(String(80), nullable=True)
    outcome = Column(String(20), nullable=False, default="success")
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
