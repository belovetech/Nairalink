#!/usr/bin/env python3
"""Flask Application for card service
"""

from flask import Flask, jsonify, abort, request
from sqlalchemy.orm.exc import NoResultFound
from db import DB

app = Flask(__name__)
db = DB()
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True


@app.route('/status', strict_slashes=False)
def getStatus():
    """Get connection status
    """
    return jsonify({"message": "Everything is cool!"})


@app.route('/cards', methods=['POST'], strict_slashes=False)
def create_card():
    """Create a new virtual card"""
    data = request.get_json()
    if type(data) is dict:
        if "account_id" in data:
            account_id = data['account_id']
        if "card_brand" in data:
            card_brand = data['card_brand']
        if "card_currency" in data:
            card_currency = data['card_currency']
        if "name_on_card" in data:
            name_on_card = data['name_on_card']
        if "pin" in data:
            pin = data['pin']
        else:
            return jsonify({'error': 'Wrong parameters'}), 400

        try:
            card = db.create_card(account_id, card_brand, card_currency, name_on_card, pin)
            return jsonify({'name': name_on_card, 'message': "Card created successfully"})
        except ValueError as err:
                return jsonify({'error': "Unable to create card"}), 400

    return jsonify({'error': "Not a dictionary"}), 401

@app.route('/cards', methods=['GET'], strict_slashes=False)
def get_all_cards():
    cards = db.all_cards()
    return jsonify({"cards": cards})


if __name__ =="__main__":
    app.run(host="0.0.0.0", port="3000")
