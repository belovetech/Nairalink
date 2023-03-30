#!/usr/bin/env python3
"""Module that handles all default RESTful API actions for card
"""
from datetime import datetime
from flask import Flask, jsonify, request
from sqlalchemy.orm.exc import NoResultFound
from models.engine.card import Cards
from models.engine.transaction import Transaction
from api.virtual_cards.views import app_views
from worker.processor import send_transaction_status
from worker.notificationProcessor import email_notification
from helpers.fundCard import fund_card
from flasgger import swag_from

from rq import Queue
from redis import Redis

redis_conn = Redis()
queue = Queue(connection=redis_conn)


app = Flask(__name__)
cd = Cards()
tr = Transaction()
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

@swag_from('docs/post_cards.yml', methods=['POST'])
@app_views.route('/cards', methods=['POST'], strict_slashes=False)
async def create_card():
    """Create a new virtual card"""
    customer_id = request.headers.get('customerid', None)
    if customer_id is None:
        return jsonify({'error': 'Service is unable identify this cutomer'}), 400
    data = request.get_json()
    accepted_card_brands = ['Visa', 'Mastercard', 'Verve']
    if type(data) is dict:
        if "card_brand" in data:
            card_brand = data['card_brand']
        if "card_currency" in data:
            card_currency = data['card_currency']
        if "name_on_card" in data:
            name_on_card = data['name_on_card']
        if "pin" in data:
            pin = data['pin']
        if "email" in data:
            email = data['email'],
        if "phone_number" in data:
            phone_number = data['phone_number']
        else:
            return jsonify({'error': 'Wrong parameters'}), 400

        try:
            #customer_id = request.get(user.id)
            if str(card_brand).capitalize() not in accepted_card_brands:
                return jsonify({'error': 'Card brand can either be Visa, Verve, or Mastercard'}), 400

            res = fund_card(customer_id, 1000)
            if res is None:
                return jsonify({'error': "server error"}), 500
            resDict = res.json()
            if resDict['status'] == 'failed':
                return jsonify({'error': resDict['message']})

            card = cd.create_card(customer_id, card_brand, card_currency, name_on_card, pin, email, phone_number)
            transaction = tr.create_transaction(
                id=resDict['data']['transactionId'],
                card_number=card.card_number,
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

            emailJob_info = queue.enqueue(email_notification, card)
            print('Card creation notification job sent to {}'.format(card.email))
            return jsonify({
                "card holder": card.name_on_card,
                'card_number': card.card_number,
                'CVV': card.cvv,
                'balance': card.balance,
                'expiry': f'{expiry.month}/{str(expiry.year)[2:]}'
            }), 201

        except Exception as err:
                print(err)
                return jsonify({'error': "server Error. unable to create card"}), 500

    return jsonify({'error': "Not a dictionary"}), 401

@swag_from('docs/get_cards.yml', methods=['GET'])
@app_views.route('/cards', methods=['GET'], strict_slashes=False)
def get_all_cards():
    """Get all cards registered"""
    cards = cd.all_cards()
    return jsonify({"results": len(cards), "cards": cards})

@swag_from('docs/get_cards_by_ID.yml', methods=['GET'])
@app_views.route('/card/<card_number>', methods=['GET'], strict_slashes=False)
def get_card_details(card_number):
    """Get a card registered to a user by card id"""
    try:
        card = cd.find_card_number(card_number)
        expiry = datetime.strptime(str(card['expiry_date']), '%Y-%m-%d %H:%M:%S')
        return jsonify({'card_details': {
            'customer_id': card['customer_id'],
            "card holder": card['name_on_card'],
            'card_number': card['card_number'],
            'card_brand': card['card_brand'],
            'CVV': card['cvv'],
            'balance': card['balance'],
            'pin': card['pin'],
            'status': card['status'],
            'expiry': f'{expiry.month}/{str(expiry.year)[2:]}'
        }}), 200
    except NoResultFound as err:
        return jsonify({'error': 'Card does not exist'})

@swag_from('docs/update_card.yml')
@app_views.route('/card/<card_number>', methods=["PATCH"], strict_slashes=False)
def update_card_status(card_number, status=""):
    """Updates the status of a virtual card"""
    data = request.get_json()
    if 'status' in data:
        status = data['status']
    else:
        return jsonify({'error': 'Wrong parameters'})

    try:
        try:
            updated_card = cd.update_card(card_number=card_number,
                                          status=status)
            if not updated_card:
                return jsonify({'error': 'Could not find card with id:{}'.format(card_number)})
        except NoResultFound as err:
            return jsonify({'error': 'Could not update card with id:{}'.format(card_number)})

        if status == "inactive":
            return jsonify({'message': 'Virtual card with card id {} has been deactivated'.format(card_number)})
        elif status == "active":
            return jsonify({'message': 'Virtual card with card id {} has been activated'.format(card_number)})
        elif status == "terminated":
            return jsonify({'message': 'Virtual card with card id {} has been deleted'.format(card_number)})
        else:
            return jsonify({'error': 'Invalid status'})
    except ValueError as err:
        return jsonify({'error': 'Could not update status of virtual card'})
