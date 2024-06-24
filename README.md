# Social Media APP

A Node.js-based social media APP that allows users to register, login, post statuses, comment on statuses, like statuses, and follow/unfollow other users.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)
- [Contributing](#contributing)

## Features

- User registration and authentication
- Posting, commenting, and liking statuses
- Following and unfollowing users
- Comprehensive test suite

## Installation

1. Clone the repository
    ```bash
    git clone https://github.com/vishusrivastva/social_media_app.git
    ```
2. Navigate to the project directory
    ```bash
    cd social-media-app
    ```
3. Install dependencies
    ```bash
    npm install
    ```
4. Set up environment variables. Create a `.env` file in the root directory and add the following:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    PORT=5000
    ```
5. Set up test environment variables. Create a `.env.test` file in the root directory and add the following:
    ```env
    MONGO_URI=your_test_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    PORT=5001
    ```
6. Set up the database
    ```bash
    node setupDatabase.js
    ```

## Usage

1. Start the server
    ```bash
    npm start
    ```
2. The API will be available at `http://localhost:5000`

## API Endpoints

### Auth

- **Register** - `POST /api/auth/register`
    ```json
    {
        "name": "string",
        "email": "string",
        "password": "string"
    }
    ```
- **Login** - `POST /api/auth/login`
    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```

### Statuses

- **Create Status** - `POST /api/statuses` (protected)
    ```formData
    {
        "text": "string",
        "image":"imageFile",
        "video":"videoFile"
    }
    ```
- **Get All Statuses** - `GET /api/statuses` (protected)
- **Get Status by ID** - `GET /api/statuses/:id` (protected)

### Comments

- **Create Comment** - `POST /api/comments` (protected)
    ```json
    {
        "text": "string",
        "statusId": "string"
    }
    ```

### Likes

- **Like a Status** - `POST /api/statuses/:id/like` (protected)

### Users

- **Get User Profile** - `GET /api/users/:id` (protected)
- **Follow a User** - `POST /api/users/:id/follow` (protected)
- **Unfollow a User** - `POST /api/users/:id/unfollow` (protected)

## Running Tests

1. Ensure MongoDB is running
2. Run the test suite
    ```bash
    npm test
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request

