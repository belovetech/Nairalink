#!/usr/bin/env python3
"""Module to handle any thing concerning dates in cards"""
from datetime import datetime, timedelta

def setExpiryDate():
    """Sets the expiry Date of the card"""
    initDate = datetime.now()
    expiryDate = initDate + timedelta(days=1460)
    return expiryDate
