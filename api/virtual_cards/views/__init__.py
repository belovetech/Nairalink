#!/usr/bin/env python3
"""Init file for /api/v1/views"""
from flask import Blueprint

app_views = Blueprint('app_views', __name__, url_prefix='/api/virtual_cards')

if app_views:
    from api.virtual_cards.views.cards import *
    #from api.virtual_cards.views.cardTransactions import *
