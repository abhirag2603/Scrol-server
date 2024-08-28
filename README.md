# Scrol - Server

Scrol is a full-stack social media application that offers a minimal and clean UI with robust backend support. This repository contains the backend codebase of Scrol, built using Node.js and Express, with MongoDB as the database.

## Features

- **Authentication**: Secure user authentication using JWT.
- **User Management**: APIs for registering users, logging in, logging out, and managing user profiles.
- **Post Management**: Create, update, delete, and fetch posts with support for images.
- **Comments & Likes**: Add comments to posts and like or unlike posts.
- **User Interaction**: Send, accept, and reject friend requests.
- **Profile Management**: Manage user profiles, including updating details like username, first name, last name, avatar, etc.
- **Search**: Search for users by name.
- **Pagination**: Support for paginated API responses for posts and user feeds.

## Tech Stack

- **Node.js**: JavaScript runtime for server-side programming.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing user and post data.
- **Mongoose**: ODM library for MongoDB and Node.js.
- **JWT**: JSON Web Token for secure authentication.
- **Multer**: Middleware for handling file uploads.
- **Bcrypt.js**: Library for hashing passwords.
- **Cors**: Middleware for enabling Cross-Origin Resource Sharing.
- **Cloudinary** : Cloud storage for storing media.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/scrol-server.git
```

Navigate to the project directory:

```bash
cd scrol-server
```
Install the dependencies:

```bash
npm install
```

or

```bash
yarn install
```

Running the Application
Start the development server:

```bash
npm start
```
or

```bash
yarn start
```
By default, the server will run on http://localhost:8000.

## API Endpoints

### Authentication

- **POST** /api/auth/register: Register a new user.
- **POST** /api/auth/login: Log in a user and receive a JWT token.
- **POST** /api/auth/logout: Log out a user.

### User

- **GET** /api/users: Search for users.
- **GET** /api/users/:id: Get a user profile by ID.
- **PUT** /api/users/:id: Update user profile.
- **POST** /api/users/friend-request: Send a friend request.
- **PUT** /api/users/friend-request/accept: Accept a friend request.
- **PUT** /api/users/friend-request/reject: Reject a friend request.

### Post

- **POST** /api/posts: Create a new post.
- **GET** /api/posts: Get all posts (supports pagination).
- **GET** /api/posts/:id: Get a post by ID.
- **PUT** /api/posts/:id: Update a post by ID.
- **DELETE** /api/posts/:id: Delete a post by ID.
- **POST** /api/posts/:id/like: Like a post.
- **POST** /api/posts/:id/comment: Comment on a post.

## Environment variables

Create a .env file in the root of the project and add your environment variables. Here is an example:

```bash
MONGO_URI=mongodb://localhost:27017/scrol
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
