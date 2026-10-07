import express from "express";
import {
  addDoctor,
  allDoctors,
  appointmentAdmin,
  loginAdmin,
  appointmentCancel,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorsController.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availab", authAdmin, changeAvailability);
adminRouter.get("/appointments", authAdmin, appointmentAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);

export default adminRouter;
