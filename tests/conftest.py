"""Test runtime setup shared by the backend suite."""

import asyncio
import sys


if sys.platform == "win32":
    # The Proactor loop can block while creating its self-pipe in restricted
    # Windows environments. Selector remains fully suitable for these tests.
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
