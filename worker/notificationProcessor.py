import requests
from datetime import datetime

async def email_notification(card_details):
    """send email notification
    """
    try:
        expiry = datetime.strptime(str(card_details.expiry_date), '%Y-%m-%d %H:%M:%S')
        card_name = card_details.name_on_card
        email = card_details.email
        card_brand = card_details.card_brand
        card_number = card_details.card_number
        cvv = card_details.cvv
        expiry_date = f'{expiry.month}/{str(expiry.year)[2:]}'
        payload = {"email": email, "card_name": card_name, "card_number": card_number, "card_brand": card_brand, "cvv": cvv, "expiry_date": expiry_date, "type": "email"}
        url = 'http://127.0.0.1:6000/api/v1/notifications'
        res = requests.post(url, json=payload)
        print(res.json())
        return res
    except Exception as err:
        print(err)
        return None

async def phone_notification(card_details):
    """Phone number notification
    """
    try:
        phone_number = card_details['phone_number']
        amount = card_details['amount']
        balance = card_details['balance']
        payload = {"phone_number": phone_number, "amount": amount, "balance": balance, "type": "sms"}
        url = 'http://127.0.0.1:6000/api/v1/notifications'
        res = requests.post(url, json=payload)
        print(res.json())
    except Exception as err:
        print(err)
        return None


