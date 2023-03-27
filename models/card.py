#!/usr/bin/env python3
"""Model for Card
"""
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, DateTime, Integer, String
from datetime import datetime
Base = declarative_base()


class Card(Base):
    """Representation of virtual card model class
    """
    __tablename__ = "cards"
    card_number = Column(String(255), nullable=True, primary_key=True)
    customer_id = Column(String(45), nullable=False, unique=True)
    name_on_card = Column(String(255), nullable=False)
    email = Column(String(55), nullable=False)
    phone_number = Column(String(55), nullable=False)
    card_brand = Column(String(15), nullable=False, default="VISA")
    card_currency = Column(String(3), nullable=False, default="NGN")
    pin = Column(String(4), nullable=False)
    balance = Column(Integer, nullable=True, default=00.00)
    date_created = Column(DateTime, default=datetime.utcnow)
    date_updated = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)
    cvv = Column(Integer, nullable=True)
    status = Column(String(15), nullable=True, default="active")
