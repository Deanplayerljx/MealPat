from __future__ import print_function
from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand
from api import db, app, socketio
import os
from api.models import User, Post, History, Restaurant, ChatRoom
import argparse
import json
import pprint
import requests
import sys
import urllib
from datetime import datetime
from flask_socketio import SocketIO

# This client code can run on Python 2.x or 3.x.  Your imports can be
# simpler if you only need one of those.
try:
    # For Python 3.0 and later
    from urllib.error import HTTPError
    from urllib.parse import quote
    from urllib.parse import urlencode
except ImportError:
    # Fall back to Python 2's urllib2 and urllib
    from urllib2 import HTTPError
    from urllib import quote
    from urllib import urlencode

map_api_key = 'AIzaSyB1KLfyE7CWowUxNFhGaHdR496U9RwX_ek'
API_KEY= 'u98RiADHFAk1NwypNWP1KzkNYBoOwHcnBzlgAaGuuepbHBZ0i71QyZHjPxgqpF2HXanhezyN_7DJozE-I-mM_-ULq6joV8FVad7jmMlhtZNOzbdu4zb4eISRCIayWnYx'
API_HOST = 'https://api.yelp.com'
SEARCH_PATH = '/v3/businesses/search'
DEFAULT_LOCATION = ['61801','61820','61821','champaign,IL']
SEARCH_LIMIT = 50

manager = Manager(app)
migrate = Migrate(app, db)
manager.add_command('db', MigrateCommand)

@manager.command
def runserver():
    socketio.run(app, host='0.0.0.0', port=8000)
    # app.run(debug=True, host='0.0.0.0', port=8000)


@manager.command
def runworker():
    app.run(debug=False)


@manager.command
def test():
    import unittest

    tests = unittest.TestLoader().discover('tests')
    unittest.TextTestRunner(verbosity=2).run(tests)


@manager.command
def recreate_db():
    """
    Recreates a local database. You probably should not use this on
    production.
    """
    db.drop_all()
    db.create_all()

    addr_set = set()
    for address in DEFAULT_LOCATION:
        bussinesses = search(API_KEY,address).get('businesses')
        print (len(bussinesses))
        for each_buss in bussinesses:
            curr_addr = ""
            for i in each_buss['location']['display_address']:
                curr_addr += i + ' '
            if(curr_addr not in addr_set):
                map_url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + curr_addr + '&' + 'key=' + map_api_key
                response = requests.request('GET', map_url)
                json_object = response.json()
                lati = json_object['results'][0]['geometry']['location']['lat']
                longi = json_object['results'][0]['geometry']['location']['lng']
                curr_category = []
                for i in each_buss['categories']:
                    curr_category.append(i['title'])
                json_res = {
                    'name' : each_buss['name'],
                    'address' : curr_addr,
                    'phonenumber' : each_buss['phone'],
                    'categories' : curr_category,
                    'rating' : each_buss['rating'],
                    'imageURL' : each_buss['image_url'],
                    'price' : each_buss['price'],
                    'lati' : lati,
                    'longi' : longi
                }
                json_object = Restaurant(json_res)
                db.session.add(json_object)
                addr_set.add(curr_addr)
        db.session.commit()

    # t = User(1234,'wew','ww','wewe','wew','wewe')
    # db.session.add(t)
    # db.session.commit()
    user_date = {'name':'dean', 'password':123, 'phonenumber':'', 'interest':'', 'gender':'', 'address':'','lati' : 40.1113161,'longi' : -88.2290516}
    u1 = User(user_date)
    db.session.add(u1)
    db.session.commit()

    ChatRoom_data = {'messages':['hi','holla']}
    t1 = ChatRoom(ChatRoom_data)
    db.session.add(t1)
    db.session.commit()

    post_data = {'RID':1, 'UID':1, 'title':'have fun', 'time':datetime.now(), 'accompanies':'', 'CID':1}
    p1 = Post(post_data)
    db.session.add(p1)
    db.session.commit()


def request(host, path, api_key, url_params=None):
    url_params = url_params or {}
    url = '{0}{1}'.format(host, quote(path.encode('utf8')))
    print(url)
    headers = {
        'Authorization': 'Bearer %s' % api_key,
    }

    print(u'Querying {0} ...'.format(url))

    response = requests.request('GET', url, headers=headers, params=url_params)
    return response.json()


def search(api_key, location):

    url_params = {
        'location': location.replace(' ', '+'),
        'limit': SEARCH_LIMIT
    }
    return request(API_HOST, SEARCH_PATH, api_key, url_params=url_params)

if __name__ == '__main__':
    manager.run()
