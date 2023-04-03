#!/usr/bin/env python3
"""Module that handles all default RESTful API actions for cardTransactions
"""
from datetime import datetime
from flask import Flask, jsonify, abort, request
from sqlalchemy.orm.exc import NoResultFound
from models.engine.transaction import Transaction
from models.engine.card import Cards
from worker.processor import send_transaction_status
from helpers.fundCard import fund_card
from worker.notificationProcessor import phone_notification
from api.virtual_cards.views import app_views
from flasgger import swag_from
from rq import Queue
from redis import Redis

redis_conn = Redis()
queue = Queue(connection=redis_conn)

app = Flask(__name__)
tr = Transaction()
cd = Cards()


app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True


@swag_from('docs/post_transaction.yml')
@app_views.route('/cards/transactions', methods=['POST'], strict_slashes=False)
async def fund_virtual_card():
    """Fund a  virtual card"""
    customer_id = request.headers.get('customerid', None)
    print("I WAS HERE")
    print(customer_id)
    if customer_id is None:
        return jsonify({'error': 'Service is unable identify this cutomer'}), 400
    data = request.get_json()
    if type(data) == dict:
        try:
            if "amount" not in data or int(data['amount']) < 500:
                return jsonify({'error': 'The minimum amount should be 500'}), 400
        except Exception as err:
            return jsonify({'error': 'invalid amount, must be a number >= 500'}), 400
        amount = int(data['amount'])
        customer_card = cd.find_card_by(customer_id=customer_id)
        print("customer_card is {}".format(customer_card))
        try:
            res = fund_card(customer_id, "Card funding", amount)
            if res is None:
                return jsonify({'error': "server error"}), 500
            resDict = res.json()
            if resDict['status'] == 'failed':
                return jsonify({'error': resDict['message']})
            job = {
                "transactionId": resDict['data']['transactionId'],
                "status": 'successful',
                "amount": amount,
                "customer_id": customer_id
            }
            transaction = tr.create_transaction(
                id=resDict['data']['transactionId'],
                card_number=customer_card.card_number,
                transaction_type='credit',
                description=data.get('description', None),
                datetime_created = datetime.now(),
                datetime_updated = datetime.now(),
                currency="NGN",
                amount=amount,
                status='pending'
            )
            print(transaction)
            if not transaction:
                job['status'] = 'failed'
                job_info = queue.enqueue(send_transaction_status, job)
                print("Could not create a transaction for this request")
                return jsonify({'error': "Unable to perform transaction"}), 500
            updated = cd.update_card(customer_card.card_number,
                                        balance=int(customer_card.balance) + amount)
            print(updated)
            if not updated:
                job['status'] = 'failed'
                tr.update_card_transaction(transaction.id, status='failed')
                job_info = queue.enqueue(send_transaction_status, job)
                print("Could not update customer's balance")
                return jsonify({'error': "Unable to perform transaction"}), 500
            tr.update_card_transaction(transaction.id, status='success')

            job_info = queue.enqueue(send_transaction_status, job)
            phoneJob_info = queue.enqueue(phone_notification, customer_card)
            print('Card funding notification job sent to {}'.format(customer_card.phone_number))
            print('Transaction with ID {} has been sent for update'.format(job.get('transactionId')))
            return jsonify({'message': 'card has been funded successfully'}), 200
        except Exception as err:
                print(err)
                return jsonify({'error': "Unable to perform transaction"}), 500
    return jsonify({'error': "Not a dictionary"}), 400

@swag_from('docs/get_transactions.yml')
@app_views.route('/cards/my-virtual-card/transactions', methods=['GET'], strict_slashes=False)
def get_all_cardTransactions():
    customer_id = request.headers.get('customerid', None)
    if customer_id is None:
        return jsonify({'error': 'Forbidden'}), 403
    card = cd.find_card_by(customer_id=customer_id)
    if card is None:
        return jsonify({'error': 'You do not have a Nairalink virtual card'}), 404
    cardTransactions = tr.all_cardTransactions(card_number=card.card_number)
    return jsonify({
        "results": len(cardTransactions),
        "transactions": cardTransactions
    }), 200

