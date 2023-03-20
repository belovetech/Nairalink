#!/usr/bin/env python3
"""Module that handles all default RESTful API actions for card
"""
from flask import Flask, jsonify, abort, request
from models.engine.db import DB
from api.virtual_cards.views import app_views

app = Flask(__name__)
db = DB()
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True


@app_views.route('/cards', methods=['POST'], strict_slashes=False)
def create_card():
    """Create a new virtual card"""
    data = request.get_json()
    if type(data) is dict:
        if "customer_id" in data:
            customer_id = data['customer_id']
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
            #customer_id = request.get(user.id)
            card = db.create_card(customer_id, card_brand, card_currency, name_on_card, pin)
            return jsonify({'name': name_on_card, 'message': "Card created successfully"})
        except ValueError as err:
                return jsonify({'error': "Unable to create card"}), 400

    return jsonify({'error': "Not a dictionary"}), 401

@app_views.route('/cards', methods=['GET'], strict_slashes=False)
def get_all_cards():
    """Get all cards registered"""
    cards = db.all_cards()
    return jsonify({"cards": cards})

@app_views.route('/cards/<card_id>', methods=['GET'], strict_slashes=False)
def get_card_details(card_id):
    """Get a card registered to a user by card id"""
    try:
        card_details = db.find_card_id(card_id)
        return jsonify({'card_details': card_details})
    except ValueError as err:
        return jsonify({'error': 'Could not find card with id:{}'.format(card_id)})

@app_views.route('/cards/<card_id>', methods=["PUT"], strict_slashes=False)
def update_card_status(card_id, status=""):
    """Updates the status of a virtual card"""
    data = request.get_json()
    if 'status' in data:
        status = data['status']
    else:
        return jsonfiy({'error': 'Wrong parameters'})

    try:
        card_status = db.update_card(card_id=card_id, status=status)
        if status == "inactive":
            return jsonify({'message': 'Virtual card with card id {} has been deactivated'.format(card_id)})
        elif status == "active":
            return jsonify({'message': 'Virtual card with card id {} has been activated'.format(card_id)})
        elif status == "terminated":
            return jsonify({'message': 'Virtual card with card id {} has been deleted'.format(card_id)})
        else:
            return jsonify({'error': 'Invalid status'})
    except ValueError as err:
        return jsonify({'error': 'Could not update status of virtual card'})
