"""
extensions.py – Shared Flask extensions for PostureTrek.
Centralized to prevent circular imports across blueprints and app.py.
"""

from flask_jwt_extended import JWTManager
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Rate limiter with IP-based client tracking and production-ready defaults
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["2000 per day", "500 per hour"],
    storage_uri="memory://",
    strategy="fixed-window",
)

# In-memory application cache
cache = Cache()

# JWT manager
jwt = JWTManager()
