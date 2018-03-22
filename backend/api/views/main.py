from api import app, db
from flask import Blueprint, request
import json
from flask import jsonify
from api.utils import create_response, InvalidUsage
from api.models import User, Restaurant, ChatRoom, Post, History
from sqlalchemy import text
mod = Blueprint('main', __name__)

SIGN_UP_URL = '/sign_up'
LOG_IN_URL = '/log_in'
SEARCH_PAGE_URL = '/search'
RESTAURANT_DETAIL_URL = '/restaurant/<int:rid>'
NEW_POST_URL = '/new_post'
POST_DETAIL_URL = '/post/<int:pid>'
# function that is called when you visit /
@app.route('/')
def index():
    sql = text('select "Messages" from chatroom')
    result = db.engine.execute(sql)
    print (result)
    var = [row[0] for row in result]
    return create_response({'result':var})

@app.route(SIGN_UP_URL, methods=['POST'])
def sign_up():
    request_json = request.get_json()
    data = {}
    try:
        data['name'] = request_json['name']
        data['password'] = request_json['password']

        if request_json['address'] == '':
            data['address'] = None
        else:
            data['address'] = request_json['address']

        if request_json['gender'] == '':
            data['gender'] = None
        else:
            data['gender'] = request_json['gender']

        if request_json['phonenumber'] == '':
            data['phonenumber'] = None
        else:
            data['phonenumber'] = request_json['phonenumber']

        if request_json['interest'] == '':
            data['interest'] = None
        else:
            data['interest'] = request_json['interest'].split(',')
        
    except:
        return create_response(message='missing required components',status=233)
    try:
        sql = text('insert into mealpat_user(phonenumber, interest, name, password, gender, address) \
            values (:phonenum, :interest, :name, :password, :gender, :address)')
        db.engine.execute(sql, phonenum=data['phonenumber'], interest=data['interest'], name=data['name'], password=data['password'], gender=data['gender'], address=data['address'])
        # new_user = User(data)
        # db.session.add(new_user)
        # db.session.commit()
        return create_response(data, status=200)
    except Exception as e:
        return create_response(message='username already exist', status=666)

@app.route(LOG_IN_URL)
def log_in():
    args = request.args
    username = ''
    password = ''
    try:
        username = args['name']
        password = args['password']
    except:
        return create_response(message='missing required components',status=233)

    sql = text('select "UID" from mealpat_user where name=:name and password=:password')
    result = db.engine.execute(sql, name=username, password=password).first()
    # user = User.query.filter_by(name = username, password = password).first()
    if result is None:
        return create_response(message='user not exist', status=233)
    else:
        return create_response({'UID':result[0]}, status=200)

@app.route(SEARCH_PAGE_URL)
def get_restaurant_list():
    restaurant_list = Restaurant.query.all()
    sql = text('select name, address, "RID" from restaurant')
    result = db.engine.execute(sql)
    # print ([row for row in result])
    data = {'name_address_rid':[(row[0], row[1], row[2]) for row in result]}
    return create_response(data, status=200)

@app.route(RESTAURANT_DETAIL_URL)
def get_restaurant_detail(rid):
    sql = text('select * from restaurant where "RID"=:rid')
    result = db.engine.execute(sql, rid=rid).first()
    if result is None:
        return create_response(message='restaurant not exist', status=233)
    items = result.items()
    data = {item[0]:item[1] for item in items}

    sql = text('select "PID", title from post where "RID"=:rid')
    result = db.engine.execute(sql, rid=rid)
    post_list = [(row[0], row[1]) for row in result]
    data['posts'] = post_list
    return create_response(data, status=200)

@app.route(POST_DETAIL_URL)
def get_post_detail(pid):
    sql = text('select * from post where "PID"=:pid')
    result = db.engine.execute(sql, rid=rid).first()
    if result is None:
        return create_response(message='restaurant not exist', status=233)
    items = result.items()
    data = {item[0]:item[1] for item in items}
    return create_response(data, status=200)
# @app.route(NEW_POST_URL)
# def create_post():

