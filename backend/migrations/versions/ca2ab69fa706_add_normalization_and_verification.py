"""Add normalization and verification

Revision ID: ca2ab69fa706
Revises: 1f4b6386575a
Create Date: 2026-09-14 16:00:36.289152

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ca2ab69fa706'
down_revision: Union[str, Sequence[str], None] = '1f4b6386575a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add columns to medicines
    op.add_column('medicines', sa.Column('aliases', sa.String(), nullable=True))
    op.add_column('medicines', sa.Column('category', sa.String(), nullable=True))
    op.add_column('medicines', sa.Column('common_strengths', sa.String(), nullable=True))

    # Add columns to prescription_medicines
    op.add_column('prescription_medicines', sa.Column('original_extracted_name', sa.String(), nullable=True))
    op.add_column('prescription_medicines', sa.Column('normalized_name', sa.String(), nullable=True))
    op.add_column('prescription_medicines', sa.Column('suggested_matches', sa.String(), nullable=True))
    op.add_column('prescription_medicines', sa.Column('verified_by', sa.Integer(), nullable=True))
    op.add_column('prescription_medicines', sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True))
    
    op.create_foreign_key(
        'fk_prescription_medicines_verified_by', 
        'prescription_medicines', 'users', 
        ['verified_by'], ['id']
    )

    # Create verification_logs table
    op.create_table(
        'verification_logs',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('prescription_medicine_id', sa.Integer(), nullable=True),
        sa.Column('test_id', sa.Integer(), nullable=True),
        sa.Column('field_name', sa.String(), nullable=False),
        sa.Column('old_value', sa.String(), nullable=True),
        sa.Column('new_value', sa.String(), nullable=True),
        sa.Column('confirmed_by', sa.Integer(), nullable=False),
        sa.Column('confirmed_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['confirmed_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['prescription_medicine_id'], ['prescription_medicines.id'], ),
        sa.ForeignKeyConstraint(['test_id'], ['tests.id'], )
    )
    op.create_index(op.f('ix_verification_logs_id'), 'verification_logs', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop verification_logs
    op.drop_index(op.f('ix_verification_logs_id'), table_name='verification_logs')
    op.drop_table('verification_logs')
    
    # Drop columns from prescription_medicines
    op.drop_constraint('fk_prescription_medicines_verified_by', 'prescription_medicines', type_='foreignkey')
    op.drop_column('prescription_medicines', 'verified_at')
    op.drop_column('prescription_medicines', 'verified_by')
    op.drop_column('prescription_medicines', 'suggested_matches')
    op.drop_column('prescription_medicines', 'normalized_name')
    op.drop_column('prescription_medicines', 'original_extracted_name')
    
    # Drop columns from medicines
    op.drop_column('medicines', 'common_strengths')
    op.drop_column('medicines', 'category')
    op.drop_column('medicines', 'aliases')
