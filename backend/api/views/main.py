from api import app, db
from flask import Blueprint, request
import json
from flask import jsonify
from api.utils import create_response, InvalidUsage
from api.models import User, Restaurant, ChatRoom, Post, History
from sqlalchemy import text
from datetime import datetime
mod = Blueprint('main', __name__)

SIGN_UP_URL = '/sign_up'
LOG_IN_URL = '/log_in'
SEARCH_PAGE_URL = '/search'
RESTAURANT_DETAIL_URL = '/restaurant/<int:rid>'
NEW_POST_URL = '/new_post'
POST_DETAIL_URL = '/post/<int:pid>'
JOIN_POST_URL = '/join_post'
DELETE_POST_URL = '/delete_post'
# function that is called when you visit /
@app.route('/')
def index():
    sql = text('select "Messages" from chatroom')
    result = db.engine.execute(sql)
    print (result)
    var = [row[0] for row in result]
    return create_response({'result':var})

# create a new user
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
            data['interest'] = []
        else:
            data['interest'] = request_json['interest'].split(',')
        
    except:
        return create_response(message='missing required components',status=411)
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

# verify login
@app.route(LOG_IN_URL)
def log_in():
    args = request.args
    username = ''
    password = ''
    try:
        username = args['name']
        password = args['password']
    except:
        return create_response(message='missing required components',status=411)

    sql = text('select "UID" from mealpat_user where name=:name and password=:password')
    result = db.engine.execute(sql, name=username, password=password).first()
    # user = User.query.filter_by(name = username, password = password).first()
    if result is None:
        return create_response(message='user not exist', status=411)
    else:
        return create_response({'UID':result[0]}, status=200)

# get a list of restaurant basic info for search page
@app.route(SEARCH_PAGE_URL)
def get_restaurant_list():
    restaurant_list = Restaurant.query.all()
    sql = text('select name, address, "RID" from restaurant')
    result = db.engine.execute(sql)
    # print ([row for row in result])
    data = {'name_address_rid':[(row[0], row[1], row[2]) for row in result]}
    return create_response(data, status=200)

# get restaurant detail information
@app.route(RESTAURANT_DETAIL_URL)
def get_restaurant_detail(rid):
    sql = text('select * from restaurant where "RID"=:rid')
    result = db.engine.execute(sql, rid=rid).first()
    if result is None:
        return create_response(message='restaurant not exist', status=411)
    items = result.items()
    data = {item[0]:item[1] for item in items}

    sql = text('select "PID", title, time from post where "RID"=:rid')
    result = db.engine.execute(sql, rid=rid)
    post_list = [(row[0], row[1],row[2]) for row in result]
    data['posts'] = post_list
    return create_response(data, status=200)

# get post detail information
@app.route(POST_DETAIL_URL)
def get_post_detail(pid):
    sql = text('select * from post where "PID"=:pid')
    result = db.engine.execute(sql, pid=pid).first()
    if result is None:
        return create_response(message='restaurant not exist', status=411)
    items = result.items()
    data = {item[0]:item[1] for item in items}
    return create_response(data, status=200)

# create a new post and a chatroom associated with it, return pid
@app.route(NEW_POST_URL, methods=['POST'])
def create_post():
    request_json = request.get_json()
    
    data = {}
    try:
        data['RID'] = int(request_json['RID'])
        data['UID'] = int(request_json['UID'])
        data['title'] = request_json['title']
        data['time'] = datetime.strptime(request_json['time'], '%Y-%m-%d %H:%M')
    except Exception as e:
        return create_response(message=str(e),status=411)

    # create a new chatroom and get back cid
    sql = text('insert into chatroom(messages) \
            values (:messages) returning "CID"')
    result = db.engine.execute(sql, messages=[]).first()
    cid = result.items()[0][1]

    # create a new post and get back pid
    sql = text('insert into post(time, title, "UID", "RID", "CID", accompanies) \
            values (:time, :title, :uid, :rid, :cid, :accompanies) returning "PID"')
    result = db.engine.execute(sql, time=data['time'], title=data['title'], uid=data['UID'], rid=data['RID'], cid=cid, accompanies=[]).first()
    pid = result.items()[0][1]

    # return the pid
    return create_response({"PID":pid}, status=200)

@app.route(JOIN_POST_URL, methods=['PUT'])
def join_post():
    request_json = request.get_json()
    data = {}
    try:
        data['PID'] = int(request_json['PID'])
        data['UID'] = int(request_json['UID'])
    except:
        return create_response(message='missing required components',status=411)

    sql = text('select accompanies from post where "PID"=:pid')
    result = db.engine.execute(sql, pid=data['PID']).first()
    accompanies = result.items()[0][1]
    print (accompanies)
    if data['PID'] in accompanies:
        return create_response(message='user have already joined the post', status=412)
    accompanies.append(data['PID'])

    sql = text('update post set accompanies=:accompanies where "PID"=:pid')
    result = db.engine.execute(sql, pid=data['PID'], accompanies=accompanies)
    return create_response(message='join succeed', status=200)

@app.route(DELETE_POST_URL, methods=['DELETE'])
def delete_post():
    request_json = request.get_json()
    data = {}
    try:
        data['PID'] = int(request_json['PID'])
        data['UID'] = int(request_json['UID'])
    except:
        return create_response(message='missing required components',status=411)

    # delete post
    sql = text('delete from post where "PID"=:pid and "UID"=:uid returning "CID"')
    result = db.engine.execute(sql, pid=data['PID'], uid=data['UID'])
    
    print (result.rowcount) 
    if result.rowcount == 0:
        return create_response(message='user does not own the post', status=412)

    # delete chatroom

    cid = result.first().items()[0][1]
    sql = text('delete from chatroom where "CID"=:cid')
    result = db.engine.execute(sql, cid=cid)
    return create_response(message='delete succeed', status=200)
