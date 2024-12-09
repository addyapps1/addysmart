// routes/chatbot.js

import express from "express";
import { chatBotController } from "../Controllers/chatBotController.js";
import * as authController from "../Controllers/authcontroller.js";


const router = express.Router();

// Route to handle chatbot requests
router.post("/minebot", authController.protect, chatBotController);

export default router;
