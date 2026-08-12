import os
from flask import Flask, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from models import db, User
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash
# from flask_caching import Cache
# from celery import Celery

from extension import cache




# ============= Database configuration =========================

app = Flask(__name__)
jwt = JWTManager(app)

# ============ Flask-caching setup configuration ================

# app.config['CACHE_TYPE'] = 'RedisCache'
# app.config['CACHE_REDIS_HOST'] = 'localhost'
# app.config['CACHE_REDIS_PORT'] = 6379
# app.config['CACHE_REDIS_DB'] = 0
# app.config['CACHE_DEFAULT_TIMEOUT'] = 300

# cache.init_app(app)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///auratrek.sqlite'
app.config['SECRET_KEY'] = 'supersecretkey'

db.init_app(app)

from routes.auth import auth_bp
app.register_blueprint(auth_bp)

# ============ CORS configuration =====================

from flask_cors import CORS

CORS(app)

@app.route('/')
def home():
    return jsonify({"status": "healthy", "message": "AuraTrek RESTful API is active."})

# ============== Running app ===================
if __name__ == "__main__":
    app.run( debug=True, port = 5000)