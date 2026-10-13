# DocConnect 🩺

DocConnect is a full-stack doctor appointment booking application that allows patients to browse doctors, book appointments, and make online payments. It also includes an administrative dashboard for managing doctors and appointments.

The project was built to demonstrate full-stack web development skills, including frontend development, REST API integration, authentication, database management, and payment processing.

## Features

### Patient Features
- **User Authentication:** Register and log in securely.
- **Browse Doctors:** Explore available doctors and view their profiles.
- **Appointment Booking:** Select a doctor and book an appointment.
- **Appointment Management:** View and cancel appointments.
- **Online Payments:** Pay for appointments using Stripe Checkout.
- **Responsive Design:** Navigate the application on desktop and mobile devices.

### Admin Features
- **Admin Authentication:** Access a protected administrative dashboard.
- **Doctor Management:** Add and manage doctor profiles.
- **Appointment Management:** View and manage appointments.
- **Availability Management:** Update doctor availability.

### Additional Features
- JWT-based authentication.
- Protected API routes.
- Image uploads using ImageKit.
- Payment status updates through Stripe webhooks.
- Toast notifications for user feedback.
- Mobile-friendly navigation.

## Screenshots

Screenshots of the application will be added here.

-->

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- Multer

### Integrations and Services
- **Stripe:** Online appointment payments.
- **ImageKit:** Image hosting and management.

## Getting Started

Follow these instructions to run DocConnect locally.

### Prerequisites

Before getting started, make sure you have installed:

- Node.js and npm
- Git
- MongoDB or access to a MongoDB database
- A Stripe account for payment testing
- An ImageKit account if you want to test image uploads

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/clutchmils/doc-connect.git
```

Navigate into the project directory:

```bash
cd doc-connect
```

#### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory and configure the required environment variables.

Start the frontend development server:

```bash
npm run dev
```

#### 3. Install admin dependencies

```bash
cd admin
npm install
```

Create a `.env` file in the frontend directory and configure the required environment variables.

Start the admin development server:

```bash
npm run dev
```

#### 4. Install backend dependencies

Open another terminal and navigate to the backend directory:

```bash
cd doc-connect/backend
npm install
```

Create a `.env` file in the backend directory and configure the required environment variables.

Start the backend server using the appropriate script defined in your backend `package.json`.

```bash
npm run server
```

## Environment Variables

DocConnect requires environment variables to configure its database connection, authentication, frontend API requests, and third-party integrations.

Create the appropriate `.env` files in the frontend, admin, and backend directories.

### Frontend Environment Variables

| Variable | Description |
|---|---|
| `VITE_BACKEND_URL` | Base URL of the backend API. |

### Admin Environment Variables

| Variable | Description |
|---|---|
| `VITE_BACKEND_URL` | Base URL of the backend API. |

### Backend Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string. |
| `JWT_SECRET` | Secret used to sign and verify JSON Web Tokens. |
| `ADMIN_EMAIL` | Email address used for admin authentication |
| `ADMIN_PASSWORD` | Admin password |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public API key. |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private API key. |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint. |
| `STRIPE_SECRET_KEY` | Stripe secret API key. |
| `STRIPE_WEBHOOK_SECRET` | Secret used to verify Stripe webhook signatures. |

 **Important:** Never commit actual API keys, passwords, JWT secrets, or other credentials to GitHub.

## Payment Integration

DocConnect integrates Stripe Checkout to process appointment payments.

The payment flow includes:

1. A patient initiates payment for an appointment.
2. The backend creates a Stripe Checkout Session.
3. The patient is redirected to Stripe Checkout.
4. Stripe processes the payment.
5. A Stripe webhook notifies the backend of the payment event.
6. The backend updates the appointment's payment status.

Webhook processing allows the backend to receive payment updates independently of the user's browser redirect.

For local testing, configure Stripe using test credentials and forward webhook events to your local backend.

## Security

Security measures implemented in the application include:

- JWT-based authentication.
- Protected backend routes.
- Verification that patients can access or manage only their own appointments.
- Server-side handling of payment operations.
- Environment variables for sensitive configuration.

Never expose secret keys or sensitive credentials in frontend code or public repositories.

## Demo

**Live Demo:** Not currently deployed.

A live demo link will be added when the application is deployed.

## Future Improvements

Potential improvements include:

- Deploying the application for public access.
- Adding automated tests.
- Improving appointment scheduling and availability management.
- Expanding the application with additional features for patients and administrators.

## Author

**Andre Thompson**

- GitHub: [@clutchmils](https://github.com/clutchmils)
