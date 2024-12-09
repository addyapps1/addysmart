import express from "express";
const router = express.Router();

import * as coinStatementController from "../Controllers/coinStatementController.js";
import * as authController from "../Controllers/authcontroller.js";
import upload from "../Utils/filehandler.js";

// ROUTES CHAINING for supportcv
router
  .route("/")
  .get(
    authController.protect,
    authController.restrict("headAccountant", "supreme"),
    coinStatementController.getCoinStatements
  )
  .post(authController.protect, coinStatementController.postCoinStatement);

router
  .route("/:_id")
  .get(
    authController.protect,
    coinStatementController.getCoinStatement
  )
  .patch(
    authController.protect,
    authController.restrict("headAccountant", "supreme"),
    coinStatementController.patchCoinStatement
  )
  .put(
    authController.protect,
    authController.restrict("headAccountant", "supreme"),
    coinStatementController.putCoinStatement
  )
  .delete(
    authController.protect,
    authController.restrict("headAccountant", "supreme"),
    coinStatementController.deleteCoinStatement
  ); // for single role

export default router;
