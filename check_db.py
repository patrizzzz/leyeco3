from app import app
from models import Post

with app.app_context():
    print('Post count:', Post.query.count())
