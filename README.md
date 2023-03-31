# NOTIFICATION SERVICE
This is the notification microservice of the Nairalink project

## TECHNOLOGIES USED
Node.js, Redis

## ROLES
The Notification microservice plays the following roles:
* Sends information to verified users of the platform through text or email

## ARCHITECTURE
Node.js is the core backend language of the notification microservice
The service also uses Redis as a client

## API INFORMATION 
```
openapi: 3.0.0
info:
  title: Notification
  description: Notification service for Nairalink
  version: 1.0.0
servers:
  - url: http://localhost:8080/api/v1/
    description: Send email and sms notification
```
## ENDPOINTS
paths:
*  /notifications:
    post:
```
      tags:
        - Notification
      summary: Send sms notification.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name_on_card:
                  type: string
                  example: Abeeb Raheem
                card_number:
                  type: string
                  example: 1234-5678-9876-4567
                email:
                  type: string
                  example: customeremail@email.com
                card_brand:
                  type: string
                  example: Visa
                cvv:
                  type: integer
                  example: 123
                expiry_date:
                  type: string
                  exmaple: 3/27
      responses:
        '201':
          description: Created
```
  /notification:
    post:
```
      tags:
        - Notification
      summary: Send phone notification.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                amount:
                  type: float
                  example: 5000.00
                balance:
                  type: float
                  example: 20000:00
                phone_Number:
                  type: string
                  example: 08109211877
      responses:
        '201':
          description: Created
```
