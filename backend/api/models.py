from api import db
from sqlalchemy.dialects.postgresql import JSON
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY

# db = SQLAlchemy()

class User(db.Model):
    '''User(UID, phonenumber, interest, name, gender, password, address)'''
    __tablename__ = "user"

    UID = db.Column(db.Integer, unique=True, primary_key=True)
    phonenumber = db.Column(db.String(12), nullable=True)
    interest = db.Column(ARRAY(db.String(20)))
    name = db.Column(db.String(20), nullable=False)
    gender = db.Column(db.String(6), nullable=True)
    password = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(50), nullable=False)


    def __init__(self, phonenumber, interest, name, gender, password, address):
        self.phonenumber = phonenumber
        self.interest = interest
        self.name = name
        self.gender = gender
        self.password = password
        self.address = address

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

    RID = db.Column(db.Integer, unique=True, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(50), nullable=False)
    rating = db.Column(db.Integer)
    imageURL = db.Column(db.String(100))
    price = db.Column(db.Integer)
    openningTime = db.Column(db.String(50))


    def __init__(self, name, address, rating, imageURL, price, openningTime):
            self.name = name
            self.address = address
            self.rating = rating
            self.imageURL = imageURL
            self.price = price
            self.openningTime = openningTime

    def __repr__(self):
        return '<restaurant {}>'.format(self.name)

class ChatRoom(db.Model):
    """ChatRoom(CID, Messages)"""
    __tablename__ = "chatroom"

    CID = db.Column(db.Integer, unique=True, primary_key=True)
    Messages = db.Column(ARRAY(db.String(100)))

    def __init__(self, Messages):
            self.Messages = Messages

    def __repr__(self):
        return '<chatroom {}>'.format(self.CID)

class Post(db.Model):
    """Post(UID, RID, time, accompanies,CID)"""
    __tablename__ = "post"

    time = db.Column(db.DateTime, unique=True, primary_key=True)
    UID = db.Column(db.Integer, db.ForeignKey('user.UID', ondelete='SET NULL'), nullable=True)
    RID = db.Column(db.Integer, db.ForeignKey('restaurant.RID', ondelete='SET NULL'), nullable=True)
    accompanies = db.Column(ARRAY(db.Integer))
    CID = db.Column(db.Integer, db.ForeignKey('chatroom.CID', ondelete='SET NULL'))

    def __init__(self, time, UID, RID, accompanies, CID):
            self.time = time
            self.UID = UID
            self.RID = RID
            self.accompanies = accompanies
            self.CID = CID

    def __repr__(self):
        return '<post {}>'.format(self.CID)

class History(db.Model):
    """History(time, UID, RID, rating, accompanies)"""
    __tablename__ = "hostory"

    time = db.Column(db.DateTime, unique=True, primary_key=True)
    UID = db.Column(db.Integer, db.ForeignKey('user.UID', ondelete='SET NULL'), nullable=True)
    RID = db.Column(db.Integer, db.ForeignKey('restaurant.RID', ondelete='SET NULL'), nullable=True)
    accompanies = db.Column(ARRAY(db.Integer))
    rating = db.Column(db.Integer)

    def __init__(self, time, UID, RID, accompanies, rating):
            self.time = time
            self.UID = UID
            self.RID = RID
            self.accompanies = accompanies
            self.rating = rating

    def __repr__(self):
        return '<post {}>'.format(self.CID)
