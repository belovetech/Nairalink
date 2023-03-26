#!/usr/bin/env python3
"""Module that handles all default RESTful API actions for cardTransactions
"""
from flask import Flask, jsonify, abort, request
from sqlalchemy.orm.exc import NoResultFound
from models.engine.db import DB
from api.worker.processor import send_transaction_status
from helpers.fundCard import fund_card
from api.virtual_cards.views import app_views
from datetime import datetime

from rq import Queue
from redis import Redis

redis_conn = Redis()
queue = Queue(connection=redis_conn)

app = Flask(__name__)
db = DB()
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True


@app_views.route('/cards/transactions', methods=['POST'], strict_slashes=False)
async def fund_card():
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
        if "narration" in data:
            narration = data['narration']
        else:
            return jsonify({'error': 'Wrong parameters'}), 400

        try:
            res = fund_card(customer_id, amount)
            resDict = res.json()

            if resDict['status'] == 'failed':
                return jsonify({'error': resDict['message']})
            transaction = db.create_transaction(
                    id=resDict['data']['transactionId'],
                    card_id=card_id,
                    transaction_type=transaction_type,
                    description=narration,
                    datetime_created = datetime.now(),
                    datetime_updated = datetime.now(),
                    currency=currency,
                    amount=amount,
                    status=resDict['status']
                )

            job = {
                "transactionId": resDict['data']['transactionId'],
                "status": 'successful'
            }
            if not transaction:
                job['status'] = 'failed'

            job_info = queue.enqueue(send_transaction_status, job)
            print('Transaction with ID {} has been sent for update'.format(job.get('transactionId')))

            card = db.update_card_transaction(id, datetime_updated=datetime.now)
        except ValueError as err:
                return jsonify({'error': "Unable to perform transaction"}), 400

    return jsonify({'error': "Not a dictionary"}), 401

@app_views.route('/cards/transactions', methods=['GET'], strict_slashes=False)
def get_all_cardTransactions():
    cardTransactions = db.all_cardTransactions()
    return jsonify({"cardTransactions": cardTransactions})

