from __future__ import print_function
from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand
from api import db, app
import os
from api.models import User, Post, History, Restaurant, ChatRoom
import argparse
import json
import pprint
import requests
import sys
import urllib


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

API_KEY= 'u98RiADHFAk1NwypNWP1KzkNYBoOwHcnBzlgAaGuuepbHBZ0i71QyZHjPxgqpF2HXanhezyN_7DJozE-I-mM_-ULq6joV8FVad7jmMlhtZNOzbdu4zb4eISRCIayWnYx'
API_HOST = 'https://api.yelp.com'
SEARCH_PATH = '/v3/businesses/search'
DEFAULT_LOCATION = ['61801','61820']
SEARCH_LIMIT = 50

manager = Manager(app)
migrate = Migrate(app, db)

manager.add_command('db', MigrateCommand)


@manager.command
def runserver():
    for address in DEFAULT_LOCATION:
        bussinesses = search(API_KEY,address).get('businesses')
        for each_buss in bussinesses:
            curr_addr = ""
            for i in each_buss['location']['display_address']:
                curr_addr += i + ','
            curr_data = Restaurant.query.all()
            exist = False
            for k in curr_data:
                if(curr_addr == k.address):
                    exist = True
                    break
            if(not exist):
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
                    'price' : each_buss['price']
                }
                json_object = Restaurant(json_res)
                # print(type(json_object))
                db.session.add(json_object)
                db.session.commit()
    app.run(debug=True, host='0.0.0.0', port=8000)


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
    # t = User(1234,'wew','ww','wewe','wew','wewe')
    # db.session.add(t)
    # db.session.commit()
    ChatRoom_data = {'messages':['hi','holla']}
    t3 = ChatRoom(ChatRoom_data)
    db.session.add(t3)
    ChatRoom_data = {'messages':['hiii','holla']}
    t4 = ChatRoom(ChatRoom_data)
    db.session.add(t4)
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
