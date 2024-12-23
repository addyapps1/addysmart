import express from "express";
const router = express.Router();

import * as balanceController from "../Controllers/balanceController.js";
import * as authController from "../Controllers/authcontroller.js";
import upload from "../Utils/filehandler.js";

// ROUTES CHAINING for supportcv
router
  .route("/withdrawable")
  .get(
    authController.protect,
    authController.restrict("headAccountant", "supreme"),
    balanceController.getWithdrawableBalances
  );

router
  .route("/notwithdrawable")
  .get(
    authController.protect,
    authController.restrict("headAccountant", "supreme"),
    balanceController.getNotWithdrawableBalances
  );

router
  .route("/withdraw")
  .post(authController.protect, balanceController.withdrawFromBalance);

router
  .route("/payin")
  .post(authController.protect, balanceController.PayInToBalance);

router
  .route("/all")
  .get(
    authController.protect,
    authController.restrict("headAccountant", "supreme"),
    balanceController.getBalances
);
  
router
  .route("/myrefbalance/:_id")
  .get(
    authController.protect,
    balanceController.getMyRefBalance
  );

router
  .route("/")
  .get(authController.protect, balanceController.getUserBalance)
  // .post(authController.protect, balanceController.postUserBalance); // allows multiple files uploads

router
  .route("/:_id")
  .get(
    authController.protect,
    authController.restrict("supreme"),
    balanceController.getOneBalance
  )
  .patch(
    authController.protect,
    authController.restrict("supreme"),
    balanceController.patchOneBalance
  )
  .put(
    authController.protect,
    authController.restrict("supreme"),
    balanceController.putOneBalance
  );
  // .delete(
  //   authController.protect,
  //   authController.restrict("supreme"),
  //   balanceController.deleteOneBalance
  // ); // for single role

export default router;
