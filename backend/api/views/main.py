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
GET_POSITION = '/get_location'
CREATE_CHAT = '/individual_chat'
FIND_PRIVATE_CHAT = '/private_chat/<int:uid>'
UPDATE_NEW_MESSAGE_STATUS = '/update_new_message'
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

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

@socketio.on('message')
def handle_message(data):
    # add message to database
    print (data)
    message = data['message']
    room = data['room']
    cid = data['cid']
    is_individual = data['is_individual']
    # if is_individual:
    #     sql = text('select messages from individual_chatroom where "CID"=:cid')
    #     result = db.engine.execute(sql, cid=int(cid)).first()
    # else:
    sql = text('select messages from chatroom where "CID"=:cid')
    result = db.engine.execute(sql, cid=int(cid)).first()
    history_message= result[0]
    history_message.append(data['message'])
    # WARNING
    sql = text('update chatroom set messages=:history where "CID"=:cid')
    result = db.engine.execute(sql, cid=int(cid),history=history_message)
    send(data['message'], broadcast=True, room=data['room'])

@socketio.on('individual_message')
def handle_individual_message(data):
    # add message to database
    sql = text('select messages, owner1, owner2 from individual_chatroom where "CID"=:cid')
    result = db.engine.execute(sql, cid=int(data['cid'])).first()
    history_message= result[0]
    owner1 = result[1]
    owner2 = result[2]
    history_message.append(data['message'])

    # owner1 is the target
    if data['target'] == owner1:
        sql = text('update individual_chatroom set messages=:history, new_message1=:new_message where "CID"=:cid')
        result = db.engine.execute(sql, cid=int(data['cid']),history=history_message, new_message=True)
    elif data['target'] == owner2:
        sql = text('update individual_chatroom set messages=:history, new_message2=:new_message where "CID"=:cid')
        result = db.engine.execute(sql, cid=int(data['cid']),history=history_message, new_message=True)

    response = {'source': data['source'], 'target': data['target'], 'room': data['room'], 'CID':data['cid'], 'source_name':data['source_name']}
    emit('individual_message', response, broadcast=True)
    print ('another room')
    print (data['room'])
    send(data['message'], broadcast=True, room=data['room'])

@socketio.on('join')
def on_join(data):
    room = data['room']
    username = data['username']
    cid = data['cid']
    is_individual = data['is_individual']
    print ('on join')
    print (username)
    print (room)
    join_room(room)
    # fetch histories
    if is_individual:
        sql = text('select messages, owner1, owner2 from individual_chatroom where "CID"=:cid')
        result = db.engine.execute(sql, cid=int(cid)).first()
        # source is owner 1
        if data['source'] == result[1]:
            sql = text('update individual_chatroom set new_message1=:new_message where "CID"=:cid')
            db.engine.execute(sql, cid=cid, new_message=False)
        # source is owner2
        elif data['source'] == result[2]:
            sql = text('update individual_chatroom set new_message2=:new_message where "CID"=:cid')
            db.engine.execute(sql, cid=cid, new_message=False)
    else:
        sql = text('select messages from chatroom where "CID"=:cid')
        result = db.engine.execute(sql, cid=int(cid)).first()
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
    data['creater_uid'] = creater_id
    data.pop('UID')
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

    sql = text('select name from history h1, history h2, restaurant where h1."UID" =:uid1 and h2."UID"=:uid2 and h1."RID" = h2."RID" and restaurant."RID"=h1."RID"')
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
    center = []
    try:
        UID = args['UID']
        distance = int(args['distance'])
        lati = args['lati']
        longi = args['longi']
    except:
        return create_response(message='missing required components',status=411)


    origins = str(lati) + ',' + str(longi)
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
        sql = text('select name from history h1, history h2, restaurant where h1."UID" =:uid1 and h2."UID"=:uid2 and h1."RID" = h2."RID" and restaurant."RID"=h1."RID"')
        result = db.engine.execute(sql, uid1=UID, uid2=cur_user['UID'])
        rows = result.fetchall()
        if len(rows) == 0:
            cur_user['common_restaurant'] = 'None'
        else:
            common_restaurant = [row[0] for row in rows]
            cur_user['common_restaurant'] = common_restaurant
        user.append(cur_user)
    dest = dest[:-1]
    url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + origins + '&destinations=' + dest + '&key=' + map_api_key
    response = requests.request('GET', url)
    json_object = response.json()
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
        lati = args['lati']
        longi = args['longi']
    except:
        return create_response(message='missing required components',status=411)


    origins = str(lati) + ',' + str(longi)
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

@app.route(GET_POSITION)
def get_position():
    args = request.args
    start_point = ''
    data = {}
    start_point = args['start_point']
    # try:
        
    # except Exception as e:
    #     return create_response(message=str(e),status=411)

    map_url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + start_point + '&' + 'key=' + map_api_key
    response = requests.request('GET', map_url)
    json_object = response.json()
    data['lati'] = json_object['results'][0]['geometry']['location']['lat']
    data['longi'] = json_object['results'][0]['geometry']['location']['lng']
    return create_response(data)

@app.route(CREATE_CHAT, methods=['POST'])
def create_individual_chat():
    request_json = request.get_json()
    try:
        source = request_json['source']
        target = request_json['target']
    except:
        create_response(message='missing required components',status=411)
    sql = text('select "CID", room_name from individual_chatroom where room_name=:name1 or room_name=:name2')
    result = db.engine.execute(sql, name1=str(source)+'_'+str(target), name2=str(target)+'_'+str(source)).first()
    # need to create a new one
    if result is None:
        # create a new chatroom and get back cid
        sql = text('insert into individual_chatroom(messages, room_name, owner1, owner2, new_message1, new_message2) \
                values (:messages, :room_name, :owner1, :owner2, :new_message, :new_message) returning "CID", room_name')
        result = db.engine.execute(sql, messages=[], room_name=str(source)+'_'+str(target), owner1=source, owner2=target, new_message=False).first()
        cid = result.items()[0][1]
        room_name = result.items()[1][1]
        return create_response({'CID':cid, 'room_name':room_name})
    else:
        return create_response({'CID':result[0], 'room_name':result[1]})

@app.route(FIND_PRIVATE_CHAT)
def find_private_chat(uid):
    sql = text('select * from individual_chatroom where owner1=:owner or owner2=:owner')
    result = db.engine.execute(sql, owner=uid).fetchall()
    chatroom_list = []
    for row in result:
        owner1 = row[3]
        owner2 = row[4]
        new_message1 = row[5]
        new_message2 = row[6]
        new_message = False
        target = None
        if owner1 == uid:
            target = owner2
            new_message = new_message1
        elif owner2 == uid:
            target = owner1
            new_message = new_message2
        sql = text('select name from mealpat_user where "UID"=:source')
        source_name = db.engine.execute(sql, source=target).first()[0]
        chatroom = {
            'source':uid,
            'target': target,
            'room': row[2],
            'CID': row[0],
            'source_name': source_name,
            'new_message': new_message
        }
        chatroom_list.append(chatroom)
    return create_response({'chatroom_list': chatroom_list})

# set the uid's new_message status to false
@app.route(UPDATE_NEW_MESSAGE_STATUS, methods=['PUT'])
def update_new_message_status():
    request_json = request.get_json()
    try:
        uid = request_json['uid']
        cid = request_json['cid']
    except:
        create_response(message='missing required components',status=411)
    sql = text('select owner1, owner2 from individual_chatroom where "CID"=:cid')
    result = db.engine.execute(sql, cid=cid).first()
    # owner1 is equal current requester
    if uid == result[0]:
        sql = text('update individual_chatroom set new_message1=:new_message where "CID"=:cid')
        result = db.engine.execute(sql, cid=cid, new_message=False)
    elif uid == result[1]:
        sql = text('update individual_chatroom set new_message2=:new_message where "CID"=:cid')
        result = db.engine.execute(sql, cid=cid, new_message=False)
    return create_response({})

