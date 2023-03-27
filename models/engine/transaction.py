#!/usr/bin/env python3
"""View to handle all card transaction objects"""
from datetime import datetime
from typing import List
from sqlalchemy import desc
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import InvalidRequestError
from models.engine.db import DB
from models.cardTransaction import CardTransaction


class Transaction(DB):
    def __init__(self) -> None:
        super().__init__()

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
            self._session.rollback()
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
