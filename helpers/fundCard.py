import requests
import json

def fund_card(customerId: str, amount: float=0) -> bool:
    """Fund card through /transaction/fund-card route
    """
    payload = {'customerId': customerId, 'amount': amount}

    url = 'http://0.0.0.0:3000/api/v1//transaction/fund-card'
    res = requests.post(url, json=payload)
    resDict = json.loads(res.text)

    if res.status_code == 201 and resDict['status'] == 'success':
        return True
    return False
