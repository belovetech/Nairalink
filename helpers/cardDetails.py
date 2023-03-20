#!/usr/bin/env python3
"""Module that generates Card number and cvv"""
import random

def generateCardNumber():
    """Function that generates card number"""
    card_number = random.randint(1, 10000000000000000)
    cardNumber = str(card_number)
    cardNumString = cardNumber[:4] + "-" + cardNumber[4:8] + "-" + cardNumber[8:12] \
            + "-" + cardNumber[12:17]
    return cardNumString

def generateCVV():
    """Function that generates card cvv"""
    cardCVV = random.randint(0, 1000)
    return cardCVV
