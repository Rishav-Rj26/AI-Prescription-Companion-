"""Add failure_reason to prescriptions

Revision ID: 1f4b6386575a
Revises: 
Create Date: 2026-09-14 11:06:10.006399

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1f4b6386575a'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('prescriptions', sa.Column('failure_reason', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('prescriptions', 'failure_reason')
