import requests
import time

async def send_transaction_status(job):
    """Send transaction status
    """
    time.sleep(10)
    url = 'http://localhost:3000/api/v1/transactions/fund-card/update'
    paylaod = {'transactionId': job.get('transactionId'),
               'status': job.get('status'),
               "amount": job.get('amount'), "customerId": job.get('customer_id')}
    res = requests.post(url, json=paylaod)
    if res.status_code == 200:
        print('Transaction with {} has been succefully updated'.
              format(job['transactionId']))
    print(res.json())
