#!/usr/bin/env python3
"""Module that handles all default RESTful API actions for cardTransactions
"""
from flask import Flask, jsonify, abort, request
from sqlalchemy.orm.exc import NoResultFound
from models.engine.db import DB
from api.virtual_cards.views import app_views

app = Flask(__name__)
db = DB()
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True


@app_views.route('/cards/transactions', methods=['POST'], strict_slashes=False)
def fund_card():
    """Fund a  virtual card"""
    data = request.get_json()
    if type(data) is dict:
        if "card_id" in data:
            card_id = data['card_id']
        if "transaction_type" in data:
            transaction_type = data['transaction_type']
        if "currency" in data:
            currency = data['currency']
        if "amount" in data:
            amount = data['amount']
        if "status" in data:
            status = data['status']
        if "narration" in data:
            narration = data['narration']
        else:
            return jsonify({'error': 'Wrong parameters'}), 400

        try:
            card = db.fund_card(card_id, transaction_type, currency, amount, status, narration)
            return jsonify({'transaction_type': transaction_type , 'amount': amount, 'message': status})
        except ValueError as err:
                return jsonify({'error': "Unable to perform transaction"}), 400

    return jsonify({'error': "Not a dictionary"}), 401

@app_views.route('/cards/transactions', methods=['GET'], strict_slashes=False)
def get_all_cardTransactions():
    cardTransactions = db.all_cardTransactions()
    return jsonify({"cardTransactions": cardTransactions})

