from api import db
from sqlalchemy.dialects.postgresql import JSON
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY

# db = SQLAlchemy()

class User(db.Model):
    '''User(UID, phonenumber, interest, name, gender, password, address)'''
    __tablename__ = "mealpat_user"

    UID = db.Column(db.Integer, unique=True, primary_key=True, nullable=False)
    phonenumber = db.Column(db.String(12))
    interest = db.Column(ARRAY(db.String(20)))
    name = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(20), nullable=False)
    gender = db.Column(db.String(6))
    address = db.Column(db.String(50))
    lati = db.Column(db.Float)
    longi = db.Column(db.Float)


    def __init__(self, data):
        self.phonenumber = data['phonenumber']
        self.interest = data['interest']
        self.name = data['name']
        self.gender = data['gender']
        self.password = data['password']
        self.address = data['address']
        self.lati = data['lati']
        self.longi = data['longi']
    def __repr__(self):
        return '<name {}>'.format(self.name)
'''
class Email(db.Model):
    """Email"""
    __tablename__ = "email"

    id = db.Column(db.Integer, unique=True, primary_key=True)
    email = db.Column(db.String, nullable=False)
    person = db.Column(db.Integer, db.ForeignKey('person.id', ondelete='SET NULL'), nullable=True)

    def __init__(self, email):
            self.email = email

    def __repr__(self):
        return '<email {}>'.format(self.email)
'''
class Restaurant(db.Model):
    """Restaurants(RID, name, address, rating, imageURL, price, openningTime, categories)"""
    __tablename__ = "restaurant"

    RID = db.Column(db.Integer, unique=True, primary_key=True, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(70))
    phonenumber = db.Column(db.String(12),nullable=True)
    categories = db.Column(ARRAY(db.String(50)))
    rating = db.Column(db.Float)
    imageURL = db.Column(db.String(100))
    price = db.Column(db.String(10))
    lati = db.Column(db.Float)
    longi = db.Column(db.Float)


    def __init__(self, data):
            self.name = data['name']
            self.address = data['address']
            self.phonenumber = data['phonenumber']
            self.categories = data['categories']
            self.rating = data['rating']
            self.imageURL = data['imageURL']
            self.price = data['price']
            self.lati = data['lati']
            self.longi = data['longi']

    def __repr__(self):
        return '<restaurant {}>'.format(self.name)

class ChatRoom(db.Model):
    """ChatRoom(CID, Messages)"""
    __tablename__ = "chatroom"

    CID = db.Column(db.Integer, unique=True, primary_key=True)
    messages = db.Column(ARRAY(db.String(100)))

    def __init__(self, data):
            self.messages = data['messages']

    def __repr__(self):
        return '<chatroom {}>'.format(self.CID)

class Post(db.Model):
    """Post(UID, RID, time, accompanies,CID)"""
    __tablename__ = "post"
    time = db.Column(db.DateTime)
    title = db.Column(db.String(50))
    PID = db.Column(db.Integer, unique=True, primary_key=True, nullable=False)
    UID = db.Column(db.Integer, db.ForeignKey('mealpat_user.UID', ondelete='CASCADE'), nullable=False)
    RID = db.Column(db.Integer, db.ForeignKey('restaurant.RID', ondelete='CASCADE'), nullable=False)
    CID = db.Column(db.Integer, db.ForeignKey('chatroom.CID', ondelete='CASCADE'), unique=True, nullable=False)
    # identified by UIDs
    accompanies = db.Column(ARRAY(db.Integer))


    def __init__(self, data):
            self.title = data['title']
            self.time = data['time']
            self.UID = data['UID']
            self.RID = data['RID']
            self.accompanies = data['accompanies']
            self.CID = data['CID']

    def __repr__(self):
        return '<post {}>'.format(self.RID)

class History(db.Model):
    """History(time, UID, RID, rating, accompanies)"""
    __tablename__ = "history"

    time = db.Column(db.DateTime)
    UID = db.Column(db.Integer, db.ForeignKey('mealpat_user.UID', ondelete='CASCADE',onupdate='CASCADE'), primary_key=True, nullable=False)
    RID = db.Column(db.Integer, db.ForeignKey('restaurant.RID', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True, nullable=False)
    accompanies = db.Column(ARRAY(db.Integer))
    rating = db.Column(db.Float)

    def __init__(self, data):
            self.time = data['time']
            self.UID = data['UID']
            self.RID = data['RID']
            self.accompanies = data['accompanies']
            self.rating = data['rating']

    def __repr__(self):
        return '<post {}>'.format(self.CID)
