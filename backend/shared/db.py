import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, scoped_session

class Base(DeclarativeBase):
    pass

_engine = None
_Session = None

def init_db(app):
    global _engine, _Session

    url = app.config.get("DATABASE_URL")
    if not url:
        os.makedirs(app.instance_path, exist_ok=True)
        url = "sqlite:///" + os.path.join(app.instance_path, "app.db")
        app.config["DATABASE_URL"] = url

    _engine = create_engine(url, future=True)
    _Session = scoped_session(sessionmaker(bind=_engine, autoflush=False, autocommit=False))

    @app.teardown_appcontext
    def remove_session(exc=None):
        _Session.remove()

def get_engine():
    return _engine

def get_session():
    return _Session()
