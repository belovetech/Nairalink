# CARD SERVICE
This is the card microservice for the NairaLink project

## TECHNOLOGIES USED
Python (Flask), MySQL, SQLAlchemy

## ROLES
The VirtualCard microservice plays the following roles:
* Receives user information from verified requests from the accounts and transaction service
* Generates virtual cards for the verified users
* Gives users autonomy over modification and updation of their virtual card details
* Enables users to fund generated virtual cards
* Grants users the ability to freeze, unfreeze or delete a generated virtual card

## ARCHITECTURE
Python(Flask) is the core backend language of the Card microservice
The service uses MySQL for the database and SQLAlchemy as an ORM

## API INFORMATION

## CARD ENDPOINTS
* All endpoints return success if there are no errors, otherwise:
```json
	{"resource": "name_of_the_resource",
 	 "status": "failed",
 	 "message" "error_message"
	}
```
### CREATE A VIRTUAL CARD
openapi: 3.0.0
servers:
  - url: http://localhost:8000/api/v1
tags:
  - name: cards

- **POST /api/v1/cards**
* This endpoint creates a new virtual card

| REQUEST DATA	|	Supported values |
| -----------   | ---------------------- |
| card_brand (str) | (required) mastercard, visa, verve |
| card_currency (str) | (required) NGN, USD |
| name_on_card (str) | (required) _delimited by whitespace_ |
| PIN (str) | (required) _four digits_ |

responses:
  '201':
    description: Successful created
  '400':
    description: Wrong parameters
  '500':
    description: Internal Server Error


### List all virtual cards under an account
openapi: 3.0.0
servers:
  - url: http://localhost:8000/api/v1
tags:
  - name: cards
get:
  description: Returns all Nairalink virtual cards

- ** GET /api/v1/cards/
* This endpoint gets all virtual cards registered under an account, [] if otherwise

RESPONSE DATA
```json
	{"resource": "list_virtual_card",
 	 "status" : "success",
 	 "data" : [{"card_brand": "VISA", "card_currency": "NGN",
           	    "card_number": "", "name_on_card": "", "expiry_month": "",
           	    "expiry_year": "", "cvv": "", "status": "active",
           	    "balance": "0.00", "date_created": <datetime>, "last_updated": <datetime>
           	   },

	   	   {"card_brand": "VISA", "card_currency": "NGN",
           	    "card_number": "", "name_on_card": "", "expiry_month": "",
           	    "expiry_year": "", "cvv": "", "status": "active",
           	    "balance": "0.00", "date_created": <datetime>, "last_updated": <datetime>
           	   }]
	}
```
responses:
  '200':
    description: Ok
  '500':
    description: Internal Server Error

### List a virtual card details
openapi: 3.0.0
servers:
  - url: http://localhost:8000/api/v1
tags:
  - name: cards
parameters:
  - name: customer_id
    in: path
    description: Return Nairalink virtual card by ID
    placeholder: 1234-0987-2344-4672
get:
  description: Get Nairalink virtual card by ID

- **GET /v1/card/:id**
* This endpoint retrieves the details of a virtual card with card_id specified

RESPONSE DATA
```json
	{"resource": "get_virtual_card",
 	 "status" : "success",
 	 "data" : {"card_brand": "VISA", "card_currency": "NGN",
           	   "card_number": "", "name_on_card": "", "expiry_month": "",
                   "expiry_year": "", "cvv": "", "status": "active",
           	   "balance": "0.00", "date_created": <datetime>, "last_updated": <datetime>
          	  }
	}
```
responses:
  '201':
    description: OK
  '400':
    description: Card not found
  '500':
    description: Internal Server Error

### UPDATE virtual card details
To block/unblock a card
openapi: 3.0.0
servers:
  - url: http://localhost:8000/api/v1
    description: Cards base URL

paths:
  /cards:
    summary: Cards endpoint
tags:
  - name: cards

- **PATCH /api/v1/card/**
* This endpoint changes a card status to either active, inactive or terminated

| REQUEST DATA  |       Supported values |
| -----------   | ---------------------- |
| card_number (str) | (required) |
| status (str) | (required) |

RESPONSE DATA
```json
	{"resource": "change_virtual_card_status",
 	 "status" : "success",
 	 "data" : {"card_number": "", "status": "new_status",
           	   "date_created": <datetime>, "last_updated": <datetime>
          	  }
	}
```
responses:
  '201':
    description: Virtual card with card number 5551-5677-2345-8642 has been activated
  '400':
    description: Could not update status of virtual card

## CARD TRANSACTIONS
These are the endpoints for card transactions

### FUND a virtual card from a Nairalink account
openapi: 3.0.0
servers:
  - url: http://localhost:8000/api/v1
tags:
  - name: card_transactions

- **POST /api/v1/cards/transactions**
This endpoint funds a virtual card from a nairalink account.

| REQUEST DATA  |       Supported values |
| -----------   | ---------------------- |
| card_id (str) | (required) |
| amount (decimal) | (required) to be converted to cents/kobos |
| currency (str) | (required) NGN, USD |
| narration (str) | (optional) |

RESPONSE DATA
```json
	{"resource": "fund_virtual_card",
 	 "status" : "success",
 	 "data" : {"transaction_id": "", "card_number": "", "amount": "amount", "narration": "",
	   	   "type": "credit", "currency: "NGN", "datetime_of_transaction": <datetime>
	   	   "status": ""
          	  }
	}
```
responses:
  '201':
    description: card has been funded
  '400':
    description: invalid amount, must be a number.
  '500':
    description: Internal Server Error

### GET transactions on a virtual_card filtered by (currency/type/status)
- **GET /v1/card/transactions/**
This endpoints gets transactions on a virtual card filtered by either currency, type, datetime or status
Otherwise, it returns all transactions done a particular virtual card

| REQUEST DATA  |       Supported values |
| -----------   | ---------------------- |
| card_id (str) | (required) |
| type (str) | (optional) either debit or credit transactions |
| currency (str) | (optional) either NGN or USD transactions |
| status (str) | (optional) either failed or successful transactions |
| limit_datetime (datetime) | (optional) datetime to limit the search (DD-MM-YYYY HH:MM:SS) |

RESPONSE DATA
```json
	{"resource": "fund_virtual_card",
 	 "status" : "success",
 	 "data" : [{"transaction_id": "", "card_id": "", "amount": "amount",
           	    "type": "debit", "currency: "NGN", "narration": "",
           	    "datetime_of_transaction": <datetime>, "status": "successful"
          	   },
	  	   {"transaction_id": "", "card_id": "", "amount": "amount",
           	    "type": "credit", "currency: "NGN", "narration": "",
           	    "datetime_of_transaction": <datetime>, "status": "failed"
          	   },
	  	   {"transaction_id": "", "card_id": "", "amount": "amount",
           	    "type": "credit", "currency: "NGN", "narration": "",
           	    "datetime_of_transaction": <datetime>, "status": "successful"
          	   }]
	}
```

## CARD TABLE
| Fields | Data type | required | default | primary key | foriegn key | index |
| ------ | --------- | -------- | ------- | ----------- | ----------- | ----- |
| customer_id     | VARCHAR   | yes      |  | no | yes |  |
| card_number | VARCHAR | yes |  | yes | no |  |
| card_brand | VARCHAR | yes | VISA / VERVE / MASTERCARD |  |  |  |
| card_currency | VARCHAR | yes | NGN / USD |  |  |  |
| name_on_card | VARCHAR | yes |  |  |  |  |
| expiry_month | VARCHAR | yes |  |  |  |  |
| expiry_year  | VARCHAR | yes |  |  |  |  |
| cvv  | VARCHAR | yes |  |  |  |  |
| PIN  | VARCHAR | yes |  |  |  |  |
| balance  | VARCHAR | yes | 0.00 |  |  |  |
| status  | VARCHAR | yes | active / inactive / terminated |  |  |  |
| date_created  | DATETIME | yes | utc iso format |  |  |  |
| last_updated  | DATETIME | yes | utc iso format |  |  |  |


## CARD TRANSACTIONS TABLE
| Fields | Data type | required | default | primary key | foriegn key | index |
| ------ | --------- | -------- | ------- | ----------- | ----------- | ----- |
| transaction_id     | VARCHAR   | yes |   | yes | no |  |
| card_number | VARCHAR | yes |  | no | yes |  |
| type | VARCHAR | yes | debit/credit |  |  |  |
| narration | VARCHAR | no |   |  |  |  |
| currency | VARCHAR | yes | NGN / USD |  |  |  |
| amount | VARCHAR | yes |  |  |  |  |
| datetime_of_transaction | Datetime | yes | utc iso format |  |  |  |
| status | VARCHAR | yes | failed / successful |  |  |  |

