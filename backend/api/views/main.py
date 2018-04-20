from api import app, db, socketio
from flask import Blueprint, request
import json
from flask import jsonify
from api.utils import create_response, InvalidUsage
from api.models import User, Restaurant, ChatRoom, Post, History
from api.api_key import map_api_key
from sqlalchemy import text
from datetime import datetime
import time
import atexit
import requests
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from flask_socketio import join_room, leave_room, send, emit

mod = Blueprint('main', __name__)

# map_api_key = 'AIzaSyCW_Aehw77ilibw2sOKbLiO3YapjKLzIf8'
SIGN_UP_URL = '/sign_up'
LOG_IN_URL = '/log_in'
SEARCH_PAGE_URL = '/search'
RESTAURANT_DETAIL_URL = '/restaurant/<int:rid>'
NEW_POST_URL = '/new_post'
POST_DETAIL_URL = '/post/<int:pid>'
JOIN_POST_URL = '/join_post'
DELETE_POST_URL = '/delete_post'
USER_HISTORY_URL = '/history/<int:uid>'
USER_INFO_URL = '/user'
FIND_NEAR_USER = '/findnearuser'
FIND_NEAR_REST = '/findnearrest'

# do constant checking
def check_old_posts():
    sql = text('select * from post where time < CURRENT_TIMESTAMP')
    result = db.engine.execute(sql)
    sql = text('delete from post where time < CURRENT_TIMESTAMP')
    db.engine.execute(sql)
    for row in result:
        sql = text('insert into history(time, "UID", "RID", accompanies) \
            values (:time, :uid, :rid, :accompanies)')
        db.engine.execute(sql, time=row[0], uid=row[3], rid=row[4], accompanies=row[6])
        sql = text('delete from chatroom where "CID"=:cid')
        db.engine.execute(sql, cid=row[5])
    # print('check')

scheduler = BackgroundScheduler()
scheduler.start()
scheduler.add_job(
    func=check_old_posts,
    trigger=IntervalTrigger(seconds=60),
    id='checking_job',
    name='check old post every five seconds',
    replace_existing=True)
# Shut down the scheduler when exiting the app
atexit.register(lambda: scheduler.shutdown())

###### socket functions

@socketio.on('connect')
def connect():
    print ('connect...')


@socketio.on('message')
def handle_message(data):

    # add message to database
    sql = text('select messages from chatroom where "CID"=:cid')
    result = db.engine.execute(sql, cid=int(data['room'])).first()
    history_message= result[0]
    print (type(history_message))
    print (history_message)
    print (data['message'])
    history_message.append(data['message'])
    print (history_message)
    print (data['room'])
    sql = text('update chatroom set messages=:history where "CID"=:cid')
    result = db.engine.execute(sql, cid=int(data['room']),history=history_message)
    send(data['message'], broadcast=True, room=data['room'])
    # print ('history: ' + history_message)

@socketio.on('join')
def on_join(data):
    room = data['room']
    username = data['username']
    join_room(room)

    # fetch histories
    sql = text('select messages from chatroom where "CID"=:cid')
    result = db.engine.execute(sql, cid=int(room)).first()
    history = result[0]

    response = {'username':username, 'history':history}
    emit('join', response, room=room)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    print ('leave')
    response = {'username':username}
    emit('leave', response, room=room)

####### endpoint functions
# function that is called when you visit /
# create a new user
@app.route(SIGN_UP_URL, methods=['POST'])
def sign_up():
    request_json = request.get_json()
    data = {}
    try:
        data['name'] = request_json['name']
        data['password'] = request_json['password']
    except:
        return create_response(message='missing required components',status=411)
    if request_json['address'] == '':
        data['address'] = None
        data['lati'] = None
        data['longi'] = None
    else:
        data['address'] = request_json['address']
        map_url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + request_json['address'] + '&' + 'key=' + map_api_key
        response = requests.request('GET', map_url)
        json_object = response.json()
        print(json_object)
        data['lati'] = json_object['results'][0]['geometry']['location']['lat']
        data['longi'] = json_object['results'][0]['geometry']['location']['lng']

    if request_json['gender'] == '':
        data['gender'] = None
    elif request_json['gender'] == "male" or request_json['gender'] == "female":
        data['gender'] = request_json['gender']
    else:
        return create_response(message='Gender format incorrect',status=411)


    if request_json['phonenumber'] == '':
        data['phonenumber'] = None
    else:
        data['phonenumber'] = request_json['phonenumber']

    if request_json['interest'] == '':
        data['interest'] = []
    else:
        data['interest'] = request_json['interest'].split(',')
    try:
        sql = text('insert into mealpat_user(phonenumber, interest, name, password, gender, address, lati, longi) \
            values (:phonenum, :interest, :name, :password, :gender, :address, :lati, :longi)')
        db.engine.execute(sql, phonenum=data['phonenumber'], interest=data['interest'],name=data['name'],
        password=data['password'], gender=data['gender'], address=data['address'], lati = data['lati'], longi = data['longi'])
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

    sql = text('select "UID", lati, longi from mealpat_user where name=:name and password=:password')
    result = db.engine.execute(sql, name=username, password=password).first()
    # user = User.query.filter_by(name = username, password = password).first()
    if result is None:
        return create_response(message='user not exist', status=411)
    else:
        print (result)
        return create_response({'UID':result[0], 'lati':result[1], 'longi':result[2]}, status=200)

# get a list of restaurant basic info for search page
@app.route(SEARCH_PAGE_URL)
def get_restaurant_list():
    restaurant_list = Restaurant.query.all()
    sql = text('select name, address, "RID", lati, longi from restaurant')
    result = db.engine.execute(sql)
    # print ([row for row in result])
    data = {'name_address_rid_lati_longi':[(row[0], row[1], row[2], row[3], row[4]) for row in result]}
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
        return create_response(message='post not exist', status=411)
    items = result.items()
    data = {item[0]:item[1] for item in items}
    creater_id = data['UID']
    sql = text('select name from mealpat_user where "UID"=:uid')
    creater_name = db.engine.execute(sql, uid=creater_id).first()[0]
    accompanies_ids = data['accompanies']
    accompanies_name = []
    for acc_id in accompanies_ids:
        sql = text('select name from mealpat_user where "UID"=:uid')
        acc_name = db.engine.execute(sql, uid=acc_id).first()[0]
        accompanies_name.append(acc_name)
    data['creater_name'] = creater_name
    data['accompanies_name'] = accompanies_name
    return create_response(data, status=200)

# get user info detail
@app.route(USER_INFO_URL)
def get_user_info():
    args = request.args
    cur_uid = None
    clicked_uid = None
    try:
        cur_uid = args['cur_uid']
        clicked_uid = args['clicked_uid']
    except:
        return create_response(message='missing required components',status=411)
    sql = text('select * from mealpat_user where "UID"=:uid')
    result = db.engine.execute(sql, uid=clicked_uid).first()
    if result is None:
        return create_response(message='user not exist', status=411)
    items = result.items()
    # basic info of user
    data = {item[0]:item[1] for item in items}

    sql = text('select name from history h1, history h2, restaurant where h1."UID" =:uid1 and h2."UID"=:uid2 and h1."RID" = h2."RID"')
    result = db.engine.execute(sql, uid1=cur_uid, uid2=clicked_uid)
    common_restaurant = [row[0] for row in result]
    data['common_restaurant'] = common_restaurant
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
    print (pid)
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

    sql = text('select accompanies, "UID" from post where "PID"=:pid')
    result = db.engine.execute(sql, pid=data['PID']).first()
    accompanies = result.items()[0][1]
    post_owner = result.items()[1][1]
    print (accompanies)

    if post_owner == data['UID']:
        return create_response(message='you are the owner', status=411)

    if data['UID'] in accompanies:
        return create_response(message='user have already joined the post', status=411)

    accompanies.append(data['UID'])

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
        return create_response(message='user does not own the post', status=411)

    # delete chatroom
    cid = result.first().items()[0][1]
    sql = text('delete from chatroom where "CID"=:cid')
    result = db.engine.execute(sql, cid=cid)
    return create_response(message='delete succeed', status=200)

@app.route(FIND_NEAR_USER)
def get_near_user_list():
    args = request.args
    UID = 0
    distance = 0
    try:
        UID = args['UID']
        distance = int(args['distance'])
    except:
        return create_response(message='missing required components',status=411)

    sql = text('select lati,longi from mealpat_user where "UID"=:uid')
    origin_result = db.engine.execute(sql, uid = UID).first()
    origins = str(origin_result[0]) + ',' + str(origin_result[1])
    sql = text('select * from mealpat_user where "UID" <> :uid')
    result = db.engine.execute(sql,uid= UID)
    dest = ''
    i = 0
    user = []
    for row in result:
        i += 1
        dest += str(row[7]) + ',' + str(row[8]) + '|'
        items = row.items()
        cur_user = {item[0]:item[1] for item in items}
        # find common restaurants
        sql = text('select name from history h1, history h2, restaurant where h1."UID" =:uid1 and h2."UID"=:uid2 and h1."RID" = h2."RID"')
        result = db.engine.execute(sql, uid1=UID, uid2=cur_user['UID'])
        rows = result.fetchall()
        if len(rows) == 0:
            print ('hiiiii')
            cur_user['common_restaurant'] = 'None'
        else:
            common_restaurant = [row[0] for row in result]
            cur_user['common_restaurant'] = common_restaurant
        user.append(cur_user)
    dest = dest[:-1]
    url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + origins + '&destinations=' + dest + '&key=' + map_api_key
    response = requests.request('GET', url)
    print (response)
    json_object = response.json()
    print(json_object)
    return_list = []
    for j in range(i):
        try:
            if((json_object['rows'][0]['elements'][j]['distance']['value']) < distance):
                return_list.append(user[j])
        except:
            continue
    return create_response(return_list, status=200)

@app.route(FIND_NEAR_REST)
def get_near_rest_list():
    sql = text('select * from restaurant')
    result = db.engine.execute(sql)
    args = request.args
    UID = 0
    distance = 0
    try:
        UID = args['UID']
        distance = int(args['distance'])
    except:
        return create_response(message='missing required components',status=411)

    sql = text('select lati,longi from mealpat_user where "UID"=:uid')
    origin_result = db.engine.execute(sql, uid = UID).first()
    origins = str(origin_result[0]) + ',' + str(origin_result[1])
    dest = ''
    i = 0
    user = []
    return_list = []
    for row in result:
        i += 1
        dest += str(row[8]) + ',' + str(row[9]) + '|'
        items = row.items()
        cur_user = {item[0]:item[1] for item in items}
        user.append(cur_user)
        if(i == 100):
            dest = dest[:-1]
            url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + origins + '&destinations=' + dest + '&key=' + map_api_key
            response = requests.request('GET', url)
            json_object = response.json()
            for j in range(100):
                if((json_object['rows'][0]['elements'][j]['distance']['value']) < distance):
                    return_list.append(user[j])
            dest = ''
            user[:] = []
    return create_response(return_list, status=200)
