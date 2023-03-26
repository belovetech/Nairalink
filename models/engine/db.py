#!/usr/bin/env python3
"""The Database module"""
from os import getenv
from typing import List
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, desc
from sqlalchemy.orm.session import Session
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import InvalidRequestError
from sqlalchemy.ext.declarative import declarative_base
from helpers.cardDates import setExpiryDate
from helpers.cardDetails import generateCardNumber, generateCVV
from models.cardTransaction import CardTransaction
from models.card import Base, Card


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

    def create_card(self, customer_id: int, brand: str,
                    currency: str, name: str, pin: int) -> Card:
        """Add a new card to the database"""
        try:
            card_number = generateCardNumber()
            date_created = datetime.now()
            date_updated = datetime.now()
            cvv = generateCVV()
            expiry_date = setExpiryDate()
            card = Card(customer_id=customer_id, card_brand=brand,
                        card_currency=currency,
                        name_on_card=name, pin=pin,
                        date_created=date_created, date_updated=date_updated,
                        cvv=cvv, card_number=card_number, expiry_date=expiry_date)
            self._session.add(card)
            self._session.commit()
            return card
        except Exception as err:
            print(err)
        return None

    def find_card_by(self, **kwargs) -> Card:
        """Find card from DB by key-value pairs argument"""
        if not kwargs or not self.valid_query_args_cards(**kwargs):
            raise InvalidRequestError

        card = self._session.query(Card).filter_by(**kwargs).one_or_none()

        if not card:
            raise NoResultFound
        return card

    def find_card_number(self, customer_id: int) -> Card:
        """Get card details by using card_number"""
        card = self.find_card_by(customer_id=customer_id)
        if not card:
            raise NoResultFound
        card_details = {}
        for key, value in card.__dict__.items():
            card_details[key] = str(value)
            if '_sa_instance_state' in card_details:
                del card_details['_sa_instance_state']
        return card_details

    def update_card(self, card_number: int, **kwargs) -> None:
        """Update card details based on card ID"""
        try:
            if not self.valid_query_args_cards(**kwargs):
                raise ValueError
            card = self.find_card_by(card_number=card_number)
            if not card:
                raise NoResultFound
            for key, value in kwargs.items():
                setattr(card, key, value)
            card.date_updated = datetime.now()
            self._session.commit()
        except Exception as err:
            self._session.rollback()
            return False
        return True

    def valid_query_args_cards(self, **kwargs):
        """Get table columns or keys"""
        columns = Card.__table__.columns.keys()
        for key in kwargs.keys():
            if key not in columns:
                return False
        return True

    def all_cards(self) -> List[Card]:
        """Returns all cards registered to a user"""
        objs = []
        cards = self._session.query(Card).order_by(Card.customer_id)
        for card in cards:
            obj = card.__dict__.copy()
            if obj['_sa_instance_state']:
                del obj['_sa_instance_state']
            objs.append(obj)
        return objs

    def all_cardTransactions(self) -> List[CardTransaction]:
        """Returns all cards"""
        objs = []
        cards = self._session.query(CardTransaction).order_by(desc(CardTransaction.datetime_updated)).all()
        for card in cards:
            obj = card.__dict__.copy()
            if obj['_sa_instance_state']:
                del obj['_sa_instance_state']
            objs.append(obj)
        return objs

    def create_transaction(self, **kwargs):
        """Starts a transaction for virtual cards
        """
        try:
            transaction = CardTransaction(**kwargs)
            self._session.add(transaction)
            self._session.commit()
            return transaction
        except Exception as err:
            print(err)
            self._session.rollback()
            return None

    def find_transaction_by(self, **kwargs) -> CardTransaction:
        """Find card from DB by key-value pairs argument"""
        if not kwargs or not self.valid_query_args_transaction(**kwargs):
            raise InvalidRequestError

        card_transaction = self._session.query(
            CardTransaction).filter_by(**kwargs).one_or_none()

        if not card_transaction:
            raise NoResultFound
        return card_transaction

    def update_card_transaction(self, transaction_id: str, **kwargs) -> None:
        """Update card transaction details based on card ID"""
        try:
            if not self.valid_query_args_transaction(**kwargs):
                raise ValueError
            card_transaction = self.find_transaction_by(id=transaction_id)
            for key, value in kwargs.items():
                setattr(card_transaction, key, value)
            card_transaction.datetime_updated = datetime.now()
            self._session.commit()
        except Exception as err:
            print(err)
            return False
        return True

    def valid_query_args_transaction(self, **kwargs):
        """Get table columns or keys"""
        columns = CardTransaction.__table__.columns.keys()
        for key in kwargs.keys():
            if key not in columns:
                return False
        return True
