#!/usr/bin/env python3
"""Module that handles all default RESTful API actions for card
"""
from flask import Flask, jsonify, abort, request
from models.engine.db import DB
from api.virtual_cards.views import app_views
from api.worker.processor import send_transaction_status
from helpers.fundCard import fund_card
from datetime import datetime

from rq import Queue
from redis import Redis

redis_conn = Redis()
queue = Queue(connection=redis_conn)


app = Flask(__name__)
db = DB()
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True


@app_views.route('/cards', methods=['POST'], strict_slashes=False)
async def create_card():
    """Create a new virtual card"""
    data = request.get_json()
    accepted_card_brands = ['Visa', 'Master', 'Verve']

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
            if str(card_brand).capitalize() not in accepted_card_brands:
                return jsonify({'error': 'Card brand can either be Visa, Verve, or Master'}), 400

            res = fund_card(customer_id, 1000)
            resDict = res.json()

            if resDict['status'] == 'failed':
                return jsonify({'error': resDict['message']})

            card = db.create_card(customer_id, card_brand, card_currency, name_on_card, pin)
            transaction = db.create_transaction(
                id=resDict['data']['transactionId'],
                card_id=card.card_number,
                transaction_type='card_creation',
                description='Charge for card creation',
                currency='NGN',
                amount=1000,
                status='success'
            )

            job = {
                "transactionId": resDict['data']['transactionId'],
                "status": 'successful'
            }
            if not transaction:
                job['status'] = 'failed'

            job_info = queue.enqueue(send_transaction_status, job)
            print('Transaction with ID {} has been sent for update'.format(job.get('transactionId')))

            expiry = datetime.strptime(str(card.expiry_date), '%Y-%m-%d %H:%M:%S')
            return jsonify({
                "card holder": card.name_on_card,
                'card_number': card.card_number,
                'CVV': card.cvv,
                'balance': card.balance,
                'expiry': f'{expiry.month}/{str(expiry.year)[2:]}'
            }), 201

        except Exception as err:
                print(err)
                return jsonify({'error': "Unable to create card"}), 500

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
        return jsonify({'error': 'Wrong parameters'})

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
