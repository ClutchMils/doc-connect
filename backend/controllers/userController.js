import validator from "validator";
import bycrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import imagekit from "../config/imagekit.js";
import fs from "fs";
import doctorModel from "../models/doctorsModel.js";
import appointmentModel from "../models/appointmentModel.js";
import Stripe from 'stripe'
import "dotenv/config";


// API  to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" });
    }

    // hashing user password
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bycrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({
        success: false,
        message: "Data Missing",
      });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      // upload image to ImageKit

      console.log("Starting ImageKit upload...");
      // Read the local file as a buffer or base64 string
      const fileBuffer = fs.readFileSync(imageFile.path);

      console.log("File read successfully");
      console.log("Uploading to ImageKit");

      const uploadResponse = await imagekit.upload({
        file: fileBuffer,
        fileName: imageFile.originalname,
      });

      console.log("ImageKit response:", uploadResponse);

      // ImageKit provides the HTTPS URL via `.url`
      const imageUrl = uploadResponse.url;

      await userModel.findByIdAndUpdate(userId, { image: imageUrl });
    }

    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor not available",
      });
    }

    let slots_booked = docData.slots_booked;

    // checking for slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "Slot not available",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");
    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fee,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({
      success: true,
      message: "Appointment booked",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    // verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({
        success: false,
        message: "Unauthorized action",
      });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slot

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime,
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// API to make payment of appointment using stripe
const paymentStripe = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // Find the appointment
    const appointmentData =
      await appointmentModel.findById(appointmentId);

    // Check whether the appointment exists
    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check whether the appointment is cancelled
    if (appointmentData.cancelled) {
      return res.status(400).json({
        success: false,
        message: 'Appointment has been cancelled',
      });
    }

    // Verify that this appointment belongs to the logged-in user.
    if (
      appointmentData.userId.toString() !== req.body.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot pay for this appointment',
      });
    }

    // Prevent paying for an appointment twice
    if (appointmentData.payment) {
      return res.status(400).json({
        success: false,
        message: 'Appointment has already been paid',
      });
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: process.env.CURRENCY || "usd",

            product_data: {
              name: "Doctor Appointment",
            },

            // Stripe expects the amount in the currency's
            // smallest unit. For USD, $50.00 becomes 5000.
            unit_amount: Math.round(appointmentData.amount * 100),
          },

          quantity: 1,
        },
      ],

      // Store the appointment ID for webhook reconciliation
      metadata: {
        appointmentId: appointmentData._id.toString(),
        userId: req.body.userId.toString(),
      },

      // Metadata attached to the PaymentIntent
      payment_intent_data: {
        metadata: {
          appointmentId: appointmentData._id.toString(),
          userId: req.body.userId.toString(),
        },
      },

      success_url: `${process.env.FRONTEND_URL}/payment-success`,

      cancel_url: `${process.env.FRONTEND_URL}/my-appointments`,
    });

    console.log("Stripe session metadata:", session.metadata);

    return res.json({
      success: true,
      sessionUrl: session.url,
    });

  } catch (error) {
    console.error('STRIPE PAYMENT ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to initiate payment',
    });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentStripe
};
