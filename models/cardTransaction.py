#!/usr/bin/env python3
"""Module to define the cardTransaction class"""
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from datetime import datetime
from models.card import Base


class CardTransaction(Base):
    """Representation of virtual card transaction model class
    """
    __tablename__ = "cardTransactions"
    id = Column(String(55), primary_key=True)
    card_number = Column(String(55), ForeignKey('cards.card_number'), nullable=False),
    transaction_type = Column(String(20), nullable=False)
    description = Column(String(60), nullable=True)
    currency = Column(String(10), nullable=False)
    amount = Column(String(15), nullable=False)
    datetime_created = Column(DateTime, nullable=False, default=datetime.utcnow)
    datetime_updated = Column(DateTime, nullable=False, default=datetime.utcnow)
    status = Column(String(10), nullable=False)
