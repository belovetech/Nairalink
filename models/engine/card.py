#!/usr/bin/env python3
"""View to handle all card objects"""
from typing import List
from datetime import datetime
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import InvalidRequestError
from helpers.cardDates import setExpiryDate
from helpers.cardDetails import generateCardNumber, generateCVV
from models.card import Card
from models.engine.db import DB

class Cards(DB):
    def __init__(self) -> None:
        super().__init__()

    def create_card(self, customer_id: str, brand: str,
                    currency: str, name: str, pin: str, email: str, phone_number: str) -> Card:
        """Add a new card to the database"""
        try:
            card_number = generateCardNumber()
            date_created = datetime.now()
            date_updated = datetime.now()
            cvv = generateCVV()
            expiry_date = setExpiryDate()
            card = Card(customer_id=customer_id,
                        card_brand=brand,
                        card_currency=currency,
                        name_on_card=name, pin=pin,
                        email=email, phone_number=phone_number,
                        date_created=date_created,
                        date_updated=date_updated,
                        cvv=cvv, card_number=card_number,expiry_date=expiry_date)
            self._session.add(card)
            self._session.commit()
            return card
        except Exception as err:
            self._session.rollback()
            print(err)
        return None

    def find_card_by(self, **kwargs) -> Card:
        """Find card from DB by key-value pairs argument"""
        try:
            if not kwargs or not self.valid_query_args_cards(**kwargs):
                raise InvalidRequestError
            card = self._session.query(Card).filter_by(**kwargs).one_or_none()
            if not card:
                raise NoResultFound
            return card
        except Exception as err:
            print(err)
            return None

    def find_card_number(self, customer_id: int) -> Card:
        """Get card details by using card_number"""
        try:
            card = self.find_card_by(customer_id=customer_id)
            card_details = {}
            for key, value in card.__dict__.items():
                card_details[key] = str(value)
                if '_sa_instance_state' in card_details:
                    del card_details['_sa_instance_state']
            return card_details
        except Exception as err:
            return None

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
