import Stripe from "stripe";
import appointmentModel from "../models/appointmentModel.js";
import "dotenv/config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  console.log("Stripe webhook received");
  console.log("Event type:", event.type);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("Webhook metadata:", session.metadata);

      // Only fulfill payments that Stripe confirms are paid.
      if (session.payment_status === "paid") {
        const { appointmentId } = session.metadata;

        console.log("Checkout session:", session.id);
        console.log("Payment status:", session.payment_status);
        console.log("Appointment ID:", session.metadata?.appointmentId);

        if (!appointmentId) {
          return res.status(400).json({
            received: false,
            message: "Missing appointment ID",
          });
        }

        const updatedAppointment = await appointmentModel.findByIdAndUpdate(
          appointmentId,
          { payment: true },
          { returnDocument: 'after' },
        );

        console.log("Updated appointment:", updatedAppointment);

        if (!updatedAppointment) {
          console.error("No appointment found for ID:", appointmentId);
        }

      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);

    return res.status(500).json({
      received: false,
    });
  }
};

export { stripeWebhook };
