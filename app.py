from flask import Flask, render_template, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Configure database (MySQL recommended for production)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Import models so they are registered with Alembic
from models import User, Post, Connection, ConnectionPoint  # noqa: E402,F401

# Sample in-memory posts — used as a fallback if DB is empty
POSTS = [
    {"id": 1, "name": "Pole A", "lat": 40.7128, "lng": -74.0060, "status": "active"},
    {"id": 2, "name": "Pole B", "lat": 40.7138, "lng": -74.0050, "status": "maintenance"},
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/posts')
def api_posts():
    # Try to return posts from DB if available, otherwise fallback to in-memory POSTS
    try:
        db_posts = Post.query.all()
        posts = [{"id": p.id, "name": p.name, "lat": p.lat, "lng": p.lng, "status": p.status} for p in db_posts]
        if posts:
            return jsonify(posts)
    except Exception:
        pass
    return jsonify(POSTS)

if __name__ == '__main__':
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
