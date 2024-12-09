import express from 'express';
const router = express.Router();

import * as supportController from "../Controllers/supportController.js";
import * as authController from '../Controllers/authcontroller.js';
import upload from '../Utils/filehandler.js';

// ROUTES CHAINING for supportcv

router
  .route("/")
  .get(authController.protect, supportController.getSupports)
  .post(
    authController.protect,
    authController.restrict("admin"),
    supportController.filesToSupport,
    upload.array("files"),
    supportController. postSupport 
  ); // allows multiple files uploads

    
    


router
  .route("/:_id")
  .get(authController.protect, supportController.getSupport)
  .patch(
    authController.protect,
    supportController.filesToSupport,
    upload.array("files"),
    supportController.patchSupport
  )
  .put(
    authController.protect,
    supportController.filesToSupport,
    upload.array("files"),
    supportController.putSupport
  )
  .delete(
    authController.protect,
    authController.restrict("admin"),
    supportController.deleteSupport
  ); // for single role

export default router;
