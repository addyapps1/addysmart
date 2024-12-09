import express from 'express';
const router = express.Router();

import * as authController from '../Controllers/authcontroller.js';
import * as transactionsController from "../Controllers/transactionsController.js";
import upload from '../Utils/filehandler.js';

// ROUTES CHAINING for supportcv
router
  .route("/deposit")
  .post(authController.protect, transactionsController.DepositFund ); // allows multiple files uploads

router
.route("/verifydeposit")
.get(
  authController.protect,
  transactionsController.getTransactionReference
); // allows multiple files uploads

router
  .route("/withdraw")
  .post(authController.protect, transactionsController.performTransfer); // allows multiple files uploads

router
  .route("/t_ref/:reference")
  .get(
    authController.protect,
    transactionsController.getTransactionReference
  ); // allows multiple files uploads

router
  .route("/")
  .get(authController.protect, transactionsController.getAllTransactions);




router
  .route("/:_id")
  .get(authController.protect, transactionsController.getTransactions)
  .patch(authController.protect, 
    authController.restrict("superAdmin", "supreme"),
    transactionsController.patchTransaction)
  .put(authController.protect, 
    authController.restrict("superAdmin", "supreme"),
    transactionsController.putTransaction)
  .delete(
    authController.protect,
    authController.restrict("superAdmin", "supreme"),
    transactionsController.deleteTransaction
  ); // for single role

export default router;
