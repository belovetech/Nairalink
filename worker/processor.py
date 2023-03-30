import requests
import time


async def send_transaction_status(job):
    """
    """
    time.sleep(10)
    url = 'http://localhost:3000/api/v1/transaction/fund-card/update'

    paylaod = {'transactionId': job.get('transactionId'),
               'status': job.get('status')}

    res = requests.post(url, json=paylaod)
    if res.status_code == 200:
        print('Transaction with {} has been succefully updated'.
              format(job['transactionId']))

    print(res.json())
