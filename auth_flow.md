# Authentication service flow

## AUTHENTICATION ROUTES

```
POST /api/v1/customers/signup - Register customer
POST /api/v1/customers/login - Login customer
GET /api/v1/customers/logout - Logout customer

POST /api/v1/customers/forgetPassword - customer forget password
PATCH /api/v1/customers/resetPassword/:token - reset customer password
PATCH /api/v1/customers/updatePassword - Update customer password
```

## CUSTOMER ROUTES

```
GET /api/v1/customers/getMe - Get customer details
PATCH /api/v1/customers/updateMe - Update some customers details except password and other sensitive ones
DELETE /api/v1/customers/deleteMe - Deactivate customer account
```

## AUTHENTICATION FLOW

- /signup

  - Jwt token is generated and set to the cookies of the response object
  - (httponly option is set to prevent XSS atack)
  - Customer data is returned along with the token

- /login

  - password and email are checked and verified
  - Token is generated and set to the cookies header
  - Token is stored to the redis server

- /logout

  - Response cookies is filled with wrong data with immediate expiry date (10 seconds) preferably
  - Token is deleted from the redis server
  - success status is returned

- /forgetPassword

  - Customer email is verified
  - Generate password reset token
  - Create reset URL
  - Send it to the customer's email

- /resetPassword/:token

  - Get the token from the URL
  - Hash the token and get user from the database
  - If user found,
    - Update the password
    - Update the password reset token to undefine
    - Update the password reset expires to undefine
    - Save it to the database
    - Send JWT token

- /updatePassword
  - Get user password and passwordConfirmation
  - Check if customer with the password exists
  - Update the password and save if customer exists
  - Send JWT token

## Process of Generating JWT token and set it to the cookies object

Utilities Function: **generateToken and sendToken**

- generateToken utility function

  - Generate unique JWT token for the registered user
  - Takes customer ID and email as parameter
  - Use jwt.sign method to generate token
  - It accepts payload, jwt secret (any secret phrase) and options {expriesIn: duration}
  - Return the generated token

- sendToken utility Function
  - Use the generated token function to get token
  - Set token to the response cookies object and also return the customer data along with token
  - Response.cookies accept cookies type, token and cookies options (expires: duration and httponly: true)
  - Also store the token to the redis server
