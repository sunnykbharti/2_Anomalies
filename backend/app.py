import os
from flask import Flask, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from models import db, User
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash
from extension import cache
# from flask_caching import Cache
# from celery import Celery


# ============= App & config =========================

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///auratrek.sqlite'
app.config['SECRET_KEY'] = 'supersecretkey'
app.config['JWT_SECRET_KEY'] = 'supersecretkey'
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'query_string']

jwt = JWTManager(app)

# ============ Flask-caching setup configuration ================

# app.config['CACHE_TYPE'] = 'RedisCache'
# app.config['CACHE_REDIS_HOST'] = 'localhost'
# app.config['CACHE_REDIS_PORT'] = 6379
# app.config['CACHE_REDIS_DB'] = 0
# app.config['CACHE_DEFAULT_TIMEOUT'] = 300

# cache.init_app(app)

# ============ Database init =====================

db.init_app(app)

with app.app_context():
    db.create_all()  # creates movement_sessions / movement_rep_logs too, since they're in models.py

# ============ Blueprints =====================

from routes.auth import auth_bp
app.register_blueprint(auth_bp)

from routes.movement import movement_bp
app.register_blueprint(movement_bp)

# ============ CORS configuration =====================

from flask_cors import CORS

CORS(app)

# ============ Routes =====================

@app.route('/')
def home():
    return jsonify({"status": "healthy", "message": "AuraTrek RESTful API is active."})

# ============== Running app ===================
if __name__ == "__main__":
    app.run(debug=True, port=5000)