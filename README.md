# ACCOUNTS AND TRANSACTION SERVICE
This is the repository for the accounts and transaction microservice
```
openapi: '3.0.0'
info:
  title: Account and Transaction API
  description: Nairalink account and tranaction services
  version: '1.0.0'

servers:
  - url: http://localhost:3000/api/v1

tags:
  - name: accounts
    description: Nairalink account routes
  - name: transactions
    description: Nairalink intra-transactions routes
```
components:
*  schemas:
    Account:
```
      type: object
      properties:
        customerId:
          type: string
        accountNumber:
          type: integer
        accountType:
          type: string
          enum: [basic, standard]
        firstName:
          type: string
        lastName:
          type: string
        email:
          type: string
        currency:
          type: string
        balance:
          type: integer
        createdAt:
          type: string
          format: date
        updateAt:
          type: string
          format: date
```
    Transaction:
```
      type: object
      properties:
        transactionId:
          type: string
        transactionType:
          type: string
          enum: [fund, transfer, withdraw]
        fromAccount:
          type: integer
        toAccount:
          type: integer
        amount:
          type: integer
        transactionDescription:
          type: string
        transactionStatus:
          type: string
          enum: [fund, transfer, withdraw]
        createdAt:
          type: string
          format: date
        updateAt:
          type: string
          format: date
```
  responses:
```
    201:
      title: successful transaction
      properties:
        message:
          type: string
          example: Transaction was successful.
    400:
      title: Unable to transfer
      type: object
      properties:
        message:
          type: string
          example: Insufficient funds to make this transaction. Top up!
    500:
      title: Unable to transfer
      type: object
      properties:
        message:
          type: string
          example: Error while processing transaction...
```
  parameters:
```
    page:
      name: page
      in: query
      description: 'By default page number is zero (0). that is first page. You can use number of page to go to a specific page. Example **page=3**'
      schema:
        type: string
    limit:
      name: limit
      in: query
      description: 'By default page size is 5. You can use limit to set the page size. Example **limit=10**'
      schema:
        type: string
    fields:
      name: fields
      in: query
      description: 'By default all the fields are included in the response object. You can fields to select only field you want in the response object. Example **fields=firstname,accountNumber,amount**'
      schema:
        type: string
    sort:
      name: sort
      in: query
      description: 'By default transactions are sorted by createdAt. You can sort by all the available fields Example **sort=amount**'
      schema:
        type: string
    customerId:
      name: customerId
      in: path
      required: true
      example: 6422f8d3cea5142afdfa0d12
      schema:
        type: string
      description: Mongodb object ID
```
paths:
*  /accounts:
    post:
```
      tags:
        - accounts
      summary: Return Nairalink account created
      description: Create Nairalink account for the user using user's details
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                customerId:
                  type: string
                  example: 6422f8d3cea5142afdfa0d12
                accountNumber:
                  type: integer
                  example: 9038028588
                firstName:
                  type: string
                  example: Abeeb
                lastName:
                  type: string
                  example: Raheem
                email:
                  type: string
                  example: abeeb@gmail.com
      responses:
        201:
          description: Created
        400:
          description: This user has already have a Nairalink account
```
    get:
```
      tags:
        - accounts
      summary: Return a list of Nairalink accounts
      description: Get all Nairalink accounts
      responses:
        200:
          description: Ok
```
  /accounts/{customerId}:
    get:
```
      tags:
        - accounts
      summary: Return Nairalink accounts by user ID
      parameters:
        - $ref: '#/components/parameters/customerId'
      responses:
        200:
          description: Ok

    delete:
      tags:
        - accounts
      summary: Delete Nairalink accounts by user ID
      parameters:
        - $ref: '#/components/parameters/customerId'
      responses:
        204:
          description: No Content
```
*  /transactions/transfer:
    post:
```
      tags:
        - transactions
      summary: Transaction betweeen Nairalink accounts
      description: Transfer money from one Nairalink account to another
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                customerId:
                  type: string
                  example: 6422acbdbcb51191a955629d
                creditAccountNumber:
                  type: integer
                  example: 9038028588
                amount:
                  type: integer
                  format: float
                  example: 1000
                description:
                  type: string
                  example: Gotv subscription
```
      responses:
```
        201:
          description: successful response
          content:
            application/json:
              schema:
                $ref: '#/components/responses/201'
        400:
          description: bad request response
          content:
            application/json:
              schema:
                $ref: '#/components/responses/400'
        500:
          description: server error response
          content:
            application/json:
              schema:
                $ref: '#/components/responses/500'
```
*  /transactions:
    get:
```
      tags:
        - transactions
      summary: Return a list of Nairalink transactions
      description: List of all Nairalink transactions
      parameters:
        - $ref: '#/components/parameters/page'
        - $ref: '#/components/parameters/limit'
        - $ref: '#/components/parameters/sort'
        - $ref: '#/components/parameters/fields'
      responses:
        200:
          description: Ok
```
*  /transactions/{customerId}:
    get:
```
      tags:
        - transactions
      summary: Return a list of Nairalink transactions
      description: List of all Nairalink transactions
      parameters:
        - $ref: '#/components/parameters/customerId'
        - $ref: '#/components/parameters/page'
        - $ref: '#/components/parameters/limit'
        - $ref: '#/components/parameters/sort'
        - $ref: '#/components/parameters/fields'
      responses:
        200:
          description: Ok
```
*  /transaction/fund-card:
    post:
```
      tags:
        - transactions
      summary: Nairalink virtual card
      description: Fund Nairalink virtual debit card through Nairalink account
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                customerId:
                  type: string
                  example: 6422f8d3cea5142afdfa0d12
                amount:
                  type: integer
                  format: float
                  example: 1000
```
      responses:
```
        201:
          description: successful response
          content:
            application/json:
              schema:
                $ref: '#/components/responses/201'
        400:
          description: bad request response
          content:
            application/json:
              schema:
                $ref: '#/components/responses/400'
        500:
          description: server error response
          content:
            application/json:
              schema:
                $ref: '#/components/responses/500'
```
