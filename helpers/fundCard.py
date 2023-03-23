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



# if __name__ == "__main__":
#     customerId = '2a181c1e-341b-4ee2-9dd5-898c730aeebc'
#     amount = 1000
#     result = fund_card(customerId, amount)
#     print(result)
