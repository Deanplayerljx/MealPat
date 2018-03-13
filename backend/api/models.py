from api import db
from sqlalchemy.dialects.postgresql import JSON
from flask_sqlalchemy import SQLAlchemy

# db = SQLAlchemy()

class Person(db.Model):
    """Person"""
    __tablename__ = "person"

    id = db.Column(db.Integer, unique=True, primary_key=True)
    name = db.Column(db.String, nullable=False)
    emails = db.relationship('Email',backref='emails')

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<name {}>'.format(self.name)

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