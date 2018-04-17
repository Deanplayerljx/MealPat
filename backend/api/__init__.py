from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import config
import os
from flask_socketio import SocketIO

app = Flask(__name__)

CORS(app)
env = os.environ.get('FLASK_ENV', 'dev')
app.config.from_object(config[env])

db = SQLAlchemy(app)
db.create_all()
db.session.commit()

app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
# import and register blueprints
from api.views import main
app.register_blueprint(main.mod)
