import express from "express";
const router = express.Router();

import * as supportticketController from "../Controllers/supportticketController.js";
import * as authController from "../Controllers/authcontroller.js";
import upload from "../Utils/filehandler.js";

// ROUTES CHAINING for supportcv
router
  .route("/all")
  .get(
    authController.protect,
    authController.restrict("admin"),
    supportticketController.getSupportTickets
  );


  router
    .route("/message/:ticketID")
    .patch(
      authController.protect,
      authController.restrict("user"),
      supportticketController.filesToSupportTicket,
      upload.array("files"),
      supportticketController.postCommunication
);
    

router
  .route("/agenthead")
  .get(
    authController.protect,
    authController.restrict("supreme", "supportmanager"),
    supportticketController.getAgentHeadSupportTickets
  );

router
  .route("/agent")
  .get(authController.protect, supportticketController.getAgentSupportTickets);

router
  .route("/")
  .get(authController.protect, supportticketController.getUserSupportTickets)
  .post(authController.protect, supportticketController.postCommunication); // allows multiple files uploads

router
  .route("/:_id")
  .get(authController.protect, supportticketController.getSupportTicket)
  .patch(authController.protect, supportticketController.patchSupportTicket)
  .put(authController.protect, supportticketController.putSupportTicket)
  .delete(
    authController.protect,
    authController.restrict("admin"),
    supportticketController.deleteSupportTicket
  ); // for single role

export default router;
