import express from 'express';
const router = express.Router();

import * as supportAgentController from "../Controllers/supportAgentController.js";
import * as authController from '../Controllers/authcontroller.js';
import upload from '../Utils/filehandler.js';

// ROUTES CHAINING for supportcv


router
  .route("/")
  .get(authController.protect, supportAgentController.getSupportAgents)
  .post(
    authController.protect,
    authController.restrict("supperAdmin"),
    supportAgentController.filesTosupportAgent,
    upload.array("files"),
    supportAgentController.postSupportAgent
  ); // allows multiple files uploads

    
    


router
  .route("/:_id")
  .get(authController.protect, supportAgentController.getSupportAgent)
  .patch(
    authController.protect,
    authController.restrict("supperAdmin"),
    supportAgentController.filesTosupportAgent,
    upload.array("files"),
    supportAgentController.patchSupportAgent
  )
  .put(
    authController.protect,
    authController.restrict("supperAdmin"),
    supportAgentController.filesTosupportAgent,
    upload.array("files"),
    supportAgentController.putSupportAgent
  )
  .delete(
    authController.protect,
    authController.restrict("supperAdmin"),
    supportAgentController.deleteSupportAgent
  ); // for single role

export default router;
