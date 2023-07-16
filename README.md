# [Nairalink](https://github.com/NairaLink)

This is a distributed fintech system that provides various services, including authentication, account transactions, card management, and notifications. Nginx is used as the API gateway to handle incoming requests and provide routing and load balancing.

![nairalink](nairalink1.png)

## Services and Technologies

The system utilizes the following technologies:

- **Auth-Service**: Node.js, MongoDB and Mongoose are used for authentication-related functionalities.
- **Account-Service**: Node.js, MySQL and sequelizer are used for managing account transactions.
- **Card-Service**: Python-Flask, MySQL, Sqlalchemy and RQ are used for card management.
- **Notification Service**: Javascript, BullMQ, Mailgun, Twilio, and Redis are utilized for handling notifications and caching.

## Installation

1. Clone the repository: `git clone https://github.com/belovetech/Nairalink`
2. Install the required dependencies for each service.
3. Configure the necessary environment variables for each service.
4. Set up the databases (MongoDB, MySQL, and Redis) and ensure they are running.
5. Start each service by running the corresponding command.

## Service Overview

### [Auth-Service](https://github.com/belovetech/Nairalink/tree/main/auth-service)

The Auth-Service handles user authentication and authorization. It is built with Node.js and utilizes MongoDB for data storage. Follow the steps below to set up and run the Auth-Service:

1. Install dependencies: `npm install`
2. Configure environment variables, such as database connection details and authentication secrets.
3. Start the service: `npm start:server`

### [Account-Service](https://github.com/belovetech/Nairalink/tree/main/account-service)

The Account-Service manages account transactions and balances. It is developed using Node.js and employs MySQL as the database. Follow these steps to set up and run the Account-Service:

1. Install dependencies: `npm install`
2. Configure environment variables, such as MySQL database connection details.
3. Start the service: `npm start:server`

### [Card-Service](https://github.com/belovetech/Nairalink/tree/main/card-service)

The Card-Service handles card management operations. It is built with Python Flask and uses MySQL for data storage. Additionally, RQ (Redis Queue) is utilized for task management. Perform the following steps to set up and run the Card-Service:

1. Install dependencies: `pip install -r requirements.txt`
2. Configure environment variables, including MySQL and Redis connection details.
3. Start the service: `python app.py`

### [Notification Service](https://github.com/belovetech/Nairalink/tree/main/notification-service)

The Notification Service sends notifications to users via email and SMS. It is developed with Python, Flask, and BullMQ and utilizes Mailgun and Twilio for email and SMS functionality. Redis is used for caching. To set up and run the Notification Service, follow these steps:

1. Install dependencies: `pip install -r requirements.txt`
2. Configure environment variables, including Mailgun, Twilio, and Redis connection details.
3. Start the service: `python app.py`

## Usage

Once all services are running, the API endpoints provided by the system are accessible through the Nginx API gateway. Refer to the API documentation for detailed information on available endpoints and their usage.

## SwaggerUI Documentation

For interactive documentation of each service, you can use the following links:

- Auth-Service: `localhost:5000/api/v1/auth/docs`
- Account-Service: `localhost:3000/api/v1/account/docs`
- Card-Service: `localhost:8000/api/v1/account/docs`
- Notification Service: `localhost:8080/api-docs`

These links will provide you with detailed information on the APIs and their respective functionalities for each service. Feel free to explore and interact with the documentation to understand how to use each service effectively.

## Meet the team

![team](team.png)

## Contribution

We welcome contributions to enhance the functionality and stability of the distributed fintech system. Please follow the guidelines in the CONTRIBUTING.md file to contribute effectively.

## License

This project is licensed under the [MIT License](LICENSE).

#### Want to know more about Nairalink?

visit [Nairalink](https://docs.google.com/presentation/d/1NU_QutNEvREIAewwDe1cI3Vwx2MtRZW6VIrthCSiXhM/edit#slide=id.gd91e1f37e_0_0)
