"""
app.py – PostureTrek Production-Ready Flask Application Entry Point.

Features:
  - Enterprise Rate Limiting (Flask-Limiter) with custom JSON responses
  - Account Lockout & Brute-Force Protection
  - Cryptographic OTP Generation & Real Email Delivery (SMTP)
  - Production Security Headers (CSP, X-Frame-Options, HSTS, etc.)
  - Centralized JSON Error Handling
  - Automatic Database Schema Migration
  - High-performance CORS and Caching
"""

import os
import uuid
import logging
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load local environment configuration if .env exists
load_dotenv()

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR      = os.path.dirname(__file__)
FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, '../frontend/dist'))
DB_PATH       = os.path.join(BASE_DIR, 'instance', 'postretrek.sqlite')

# ── Logging Setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [%(name)s] %(message)s'
)
logger = logging.getLogger("posturetrek.app")

# ── Create Flask App ─────────────────────────────────────────────────────────
app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')

# ── Secret Key Guard ─────────────────────────────────────────────────────────
_secret_key     = os.getenv('SECRET_KEY')
_jwt_secret_key = os.getenv('JWT_SECRET_KEY')
_is_dev         = os.getenv('FLASK_ENV', 'development') == 'development'

if not _secret_key:
    if _is_dev:
        _secret_key = 'dev-insecure-secret-key-32-chars-minimum-posturetrek'
        logger.warning("[SECURITY] SECRET_KEY not set — using dev default. Set SECRET_KEY in .env for production.")
    else:
        raise ValueError("SECRET_KEY environment variable must be set in production.")

if not _jwt_secret_key:
    if _is_dev:
        _jwt_secret_key = 'dev-insecure-jwt-key-32-chars-minimum-posturetrek'
        logger.warning("[SECURITY] JWT_SECRET_KEY not set — using dev default. Set JWT_SECRET_KEY in .env for production.")
    else:
        raise ValueError("JWT_SECRET_KEY environment variable must be set in production.")

app.config.update(
    SQLALCHEMY_DATABASE_URI        = f'sqlite:///{DB_PATH}',
    SQLALCHEMY_TRACK_MODIFICATIONS = False,
    SECRET_KEY                     = _secret_key,
    JWT_SECRET_KEY                 = _jwt_secret_key,
    JWT_TOKEN_LOCATION             = ['headers'],
    CACHE_TYPE                     = 'SimpleCache',
    CACHE_DEFAULT_TIMEOUT          = 300,
    MAX_CONTENT_LENGTH             = 4 * 1024 * 1024,      # 4 MB max body limit
    RATELIMIT_HEADERS_ENABLED      = True,                  # Expose X-RateLimit headers to client
)

# ── Extensions Initialization ────────────────────────────────────────────────
from models import db, auto_migrate
from extensions import limiter, cache, jwt

db.init_app(app)
limiter.init_app(app)
cache.init_app(app)
jwt.init_app(app)

# ── CORS Configuration ───────────────────────────────────────────────────────
_allowed_origins = os.getenv(
    'CORS_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5000,http://127.0.0.1:5000'
).split(',')
CORS(app, origins=_allowed_origins, supports_credentials=True)

# ── Database Init & Schema Auto-Migrate ─────────────────────────────────────
with app.app_context():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    # Automatically add missing columns/tables without losing existing data
    auto_migrate()

# ── Production Security Headers & Request ID ─────────────────────────────────
@app.before_request
def before_request_hook():
    """Assign a unique request ID for distributed tracing and logging."""
    request.request_id = request.headers.get('X-Request-ID') or str(uuid.uuid4())


@app.after_request
def apply_security_headers(response):
    """Inject industry standard production HTTP security headers."""
    response.headers['X-Request-ID'] = getattr(request, 'request_id', '')
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'camera=(self), microphone=()'

    # Strict HSTS when serving over TLS/HTTPS
    if request.is_secure or request.headers.get('X-Forwarded-Proto', '').lower() == 'https':
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'

    return response

# ── Centralized Error Handlers ───────────────────────────────────────────────
@app.errorhandler(429)
def ratelimit_handler(e):
    """Uniform JSON response for rate limits."""
    return jsonify({
        "error": "Too Many Requests",
        "message": f"Rate limit exceeded: {getattr(e, 'description', 'Too many requests. Please slow down.')}",
        "retry_after_seconds": getattr(e, 'retry_after', 60)
    }), 429


@app.errorhandler(400)
def bad_request(e):
    return jsonify({
        "error": "Bad Request",
        "message": getattr(e, 'description', 'Invalid request format or missing parameters.')
    }), 400


@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({
            "error": "Not Found",
            "message": f"Endpoint '{request.path}' was not found on this server."
        }), 404
    # For SPA routes, fallback to index.html
    return serve_spa('')


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({
        "error": "Method Not Allowed",
        "message": f"HTTP {request.method} is not permitted for '{request.path}'."
    }), 405


@app.errorhandler(413)
def request_entity_too_large(e):
    return jsonify({
        "error": "Payload Too Large",
        "message": "Uploaded content exceeds the maximum allowed payload size (4 MB)."
    }), 413


@app.errorhandler(500)
def internal_server_error(e):
    logger.error(f"[SERVER ERROR] Unhandled 500 error on {request.path}: {e}", exc_info=True)
    return jsonify({
        "error": "Internal Server Error",
        "message": "An unexpected error occurred. Our engineering team has been notified.",
        "request_id": getattr(request, 'request_id', '')
    }), 500

# ── Register Blueprints ──────────────────────────────────────────────────────
from routes.auth      import auth_bp
from routes.movement  import movement_bp
from routes.dashboard import dashboard_bp
from routes.sessions  import sessions_bp
from routes.emotion   import emotion_bp

app.register_blueprint(auth_bp)
app.register_blueprint(movement_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(sessions_bp)
app.register_blueprint(emotion_bp)

# ── SPA Catch-All ────────────────────────────────────────────────────────────
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_spa(path):
    full = os.path.join(app.static_folder, path)
    if path and os.path.exists(full):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# ── Health Check ─────────────────────────────────────────────────────────────
@app.route('/api/health')
def health():
    return jsonify({
        "status": "ok",
        "app": "PostureTrek API",
        "environment": os.getenv('FLASK_ENV', 'development'),
        "rate_limiting": "active",
        "security": "hardened"
    })

# ── Run ──────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    _debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=_debug, port=5000)