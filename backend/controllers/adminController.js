import validator from "validator";
import bycrypt from "bcrypt";
import fs from "fs";
import imagekit from "../config/imagekit.js";
import doctorModel from "../models/doctorsModel.js";
import jwt from "jsonwebtoken";
import 'dotenv/config'

// API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fee,
      address,
    } = req.body;
    const imageFile = req.file;

    // console.log("BODY:", req.body);
    // console.log("FILE:", req.file);

    // checking for all data to add doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fee ||
      !address
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // validatin email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing doctor password
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);

    //validating image
    if (!imageFile) {
      return res.json({
        success: false,
        message: "Image is required",
      });
    }

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

    const doctorsData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fee,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorsData);
    await newDoctor.save();

    // ... Save doctorsData to database or process further
    res.json({
      success: true,
      message: "Doctor Added",
    });
  } catch (error) {
    console.log("ADD DOCTOR ERROR:", error);
    // res.json({ success: false, message: error.message });

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({
        success: true,
        token,
      });
    } else {
      res.json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.log("Admin Login ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { addDoctor, loginAdmin };
