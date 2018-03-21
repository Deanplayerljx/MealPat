from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand
from api import db, app
import os 
from api.models import User


manager = Manager(app)
migrate = Migrate(app, db)

manager.add_command('db', MigrateCommand)


@manager.command
def runserver():
    app.run(debug=True, host='0.0.0.0', port=5000)


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
    t = User(1234,'wew','ww','wewe','wew','wewe')
    db.session.add(t)
    db.session.commit()


if __name__ == '__main__':
    manager.run()