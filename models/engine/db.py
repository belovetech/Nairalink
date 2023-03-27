#!/usr/bin/env python3
"""The Database module"""
from os import getenv
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm.session import Session
from models.card import Base


class DB:
    """Database Connector class"""
    def __init__(self) -> None:
        """Initialises a new DB instance"""
        DB_USER = getenv("DB_USER")
        DB_PWD = getenv("DB_PWD")
        DB_NAME = getenv("DB_NAME")
        ENV = getenv("ENV")
        self.__engine = create_engine("mysql+mysqldb://{}:{}@localhost:3306/{}"
                                      .format(DB_USER, DB_PWD, DB_NAME))

        if "ENV" == "test":
            Base.metadata.drop_all(self.__engine)

        Base.metadata.create_all(self.__engine)
        self.__session = None

    @property
    def _session(self) -> Session:
        """Memoized session object
        """
        if self.__session is None:
            DBSession = sessionmaker(bind=self.__engine)
            self.__session = DBSession()
        return self.__session
