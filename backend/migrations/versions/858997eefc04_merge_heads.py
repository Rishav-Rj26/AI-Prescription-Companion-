"""merge heads

Revision ID: 858997eefc04
Revises: 388145e6f85f, b7d1a2f6e9c3
Create Date: 2026-10-16 09:07:31.031147

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '858997eefc04'
down_revision: Union[str, Sequence[str], None] = ('388145e6f85f', 'b7d1a2f6e9c3')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
