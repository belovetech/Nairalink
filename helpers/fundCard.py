import requests
import json

def fund_card(customerId: str, amount: float=0, description: str='card funding') -> bool:
    """Fund card through /transaction/fund-card route
    """
    try:
        payload = {'customerId': customerId, 'amount': amount, 'description': description}
        url = 'http://0.0.0.0:3000/api/v1/transaction/fund-card'
        res = requests.post(url, json=payload)
        return res
    except Exception as err:
        print(err)
        return None
