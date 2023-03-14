#!/usr/bin/env python3
"""Model for Card
"""
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from datetime import datetime
Base = declarative_base()


class Card(Base):
    """Representation of virtual card model class
    """
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True, autoincrement=True)
    account_id = Column(Integer, nullable=False) #ForeignKey("accounts.id"))
    name_on_card = Column(String(255), nullable=False)
    card_brand = Column(String(15), nullable=False, default="VISA")
    card_currency = Column(String(3), nullable=False, default="NGN")
    pin = Column(Integer, nullable=False, default=0000)
    balance = Column(String(13), nullable=True, default='00.00')
    date_created = Column(DateTime, default=datetime.utcnow)
    date_updated = Column(DateTime, default=datetime.utcnow)
    card_number = Column(String(255), nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    cvv = Column(Integer, nullable=True)
    status = Column(String(15), nullable=True, default="inactive")
