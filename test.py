import requests

payload = { 'firtsName': 'Abeeb', 'lastName': 'Raheem'}


r = requests.post("http://0.0.0.0:5000/api/v1/customers/signup", json=payload,)


print(r.json())
