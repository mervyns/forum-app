# Forum Management App
This is a basic Forum Management App built in React for the Frontend, utilising React hooks and Stateless Functional Components (SFC) for most of the build.

The Backend is built with AWS SAM in NodeJS for easy deployment onto AWS Lambda for Serverless Micro-architecture style.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Running locally
### Prerequisites
- NodeJS
- AWS SAM [https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started.html]
- Docker

### Set Up Docker and DynamoDB
Ensure the Docker Daemon is running on your machine.
Run the following commands
```
cd backend/build
sh localdb.sh
node $(pwd)/build/createtable.js
```
You only need to create the table in the initial set-up. It will drop and create the table each time you run the command so take note to only do it as needed, or you will lose your data everytime you run the command

### Installing
It is your choice on which package manager to run. I have chosen to use yarn in the examples, however NPM works perfectly fine and all you have to do is replace the yarn commands with npm commands.

To install backend
```
cd backend
yarn
```

To install frontend
```
cd frontend
yarn
```
### Running The Code
To run **backend**:
```
cd backend
sam local start-api
```

To run **frontend**:
```
cd frontend
yarn start
```

### Testing the code
We currently use Jest and Enzyme for testing purposes.
Testing is a WIP and more tests will be added as further developments.

To run tests
```
cd frontend
yarn test
```

## Running The App
Once done, navigate to http://localhost:5000 and you should be able to view the working React App in your window. Firefox is recommended for speed and ease of use. I have fixed most of the Cross-Origin Request (CORS) issues, but should you encounter a CORS issue whilst doing local development / testing, please enable the CORS plugin on your browser and report the issue to me.

## License
This project is licensed under the MIT License