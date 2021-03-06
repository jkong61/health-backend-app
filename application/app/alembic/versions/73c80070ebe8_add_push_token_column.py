"""Add push token column

Revision ID: 73c80070ebe8
Revises: 930131d4fd37
Create Date: 2021-03-13 23:54:23.256289

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '73c80070ebe8'
down_revision = '930131d4fd37'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('User', sa.Column('push_token', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('User', 'push_token')
    # ### end Alembic commands ###
