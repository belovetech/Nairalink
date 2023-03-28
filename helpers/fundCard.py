import requests
import json

def fund_card(customerId: str, amount: float=0,) -> bool:
    """Fund card through /transaction/fund-card route
    """
    try:
        payload = {'customerId': customerId, 'amount': amount}
        url = 'http://127.0.0.1:3000/api/v1/transaction/fund-card'
        res = requests.post(url, json=payload)
        return res
    except Exception as err:
        print(err)
        return None
