from api import app
from flask import Blueprint, request
import json
from flask import jsonify
from api.utils import create_response, InvalidUsage
from api.models import User
mod = Blueprint('main', __name__)

SIGN_UP_URL = 'end1'
LOG_IN_URL = 'end2'
SEARCH_PAGE_URL = 'end3'
RESTAURANT_URL = 'end4'
NEW_POST_URL = 'end5'
POST_DETAIL_URL = 'end6'
# function that is called when you visit /
@app.route('/')
def index():
    return '<h1>Hello World!</h1>'

# function that is called when you visit /persons
# @app.route('/persons')
# def name():
#     try:
#         create_response(data=Person.query.all())
#     except Exception as ex:
#         return create_response(data={}, status=400, message=str(ex))

@app.route('/post')
def get_post():
    try:
        data = User.query.all()
        print(data)
        return create_response(data=data)
    except Exception as e:
        return create_response(status=400, message=str(e))
