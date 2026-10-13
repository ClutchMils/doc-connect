// PaymentSuccess.jsx

import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg sm:p-10">
        {/* Success icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-10 w-10 text-green-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m5 12 4 4L19 6"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Thank You!
        </h1>

        <p className="mt-3 text-gray-600">
          You've returned from checkout. We're confirming your payment.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Your appointment's payment status will update once Stripe confirms the
          payment.
        </p>

        {/* Return button */}
        <Link
          to="/my-appointments"
          className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Return to My Appointments
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
