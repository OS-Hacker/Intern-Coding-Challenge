# Store Rating Platform

A web application that allows users to submit ratings for stores registered on the platform. The system supports **role-based access**, including **System Administrators, Normal Users, and Store Owners**.

## Tech Stack

- **Backend:** ExpressJS / NodeJS
- **Database:** Mongodb
- **Frontend:** ReactJS

## Features

### System Administrator
- Can **add new stores and users**.
- Has access to a **dashboard** displaying:
  - Total users, stores, and submitted ratings.
- Can view and manage **users and stores**.
- Can apply **filters and sorting** to listings.

### Normal User
- Can **sign up, log in**, and **submit ratings** for stores (1 to 5).
- Can update their **password**.
- Can **view and search stores** by name and address.
- Can **modify their submitted rating**.

### Store Owner
- Can **log in** and manage their **store ratings**.
- Can view a **list of users who rated their store**.
- Can see the **average rating** of their store.

### Database Schema
- **users** - Stores user information
- **stores** - Contains store details
- **ratings** - Tracks user ratings for stores

## Form Validations
- **Name:** Min 20 characters, Max 60 characters.
- **Address:** Max 400 characters.
- **Password:** 8-16 characters, must include **one uppercase letter and one special character**.
- **Email:** Must follow standard **email validation rules**.

## Additional Notes
- Tables should support **sorting (ascending/descending)**.
- Follow **best practices** for frontend and backend development.
- Ensure **secure authentication** and **role-based access control**.

## Installation

### Backend Setup

Navigate to the backend directory:

cd backend

### Install dependencies

npm install

### Start the server

npm start  # Development mode with nodemon

### Frontend Setup

Navigate to the frontend directory:

cd frontend

### Install dependencies

npm install

### Start the development server

npm run dev 

### Environment Variables for Production

- PORT=5000
- MONGO_URI=mongodb+srv://omshinde:r7JWJhIQmqSQFhyP@cluster0.6ak47cd.mongodb.net/systemDB
- JWT_SECRET = JDJDJDJDDJDBDGVSFSDAT




