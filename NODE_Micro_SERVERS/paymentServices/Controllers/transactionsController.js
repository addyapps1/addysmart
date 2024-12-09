import axios from "axios";
import Transaction from "../Models/Transaction.js";
import mongoose from "mongoose";
import UserAccount from "../Models/UserAccountDetails.js"; // Import UserAccount model

import ApiFeatures from "../Utils/ApiFeatures.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import CustomError from "../Utils/CustomError.js";
import paginationCrossCheck from "../Utils/paginationCrossCheck.js";
import UnlinkMultipleFiles from "../Utils/UnlinkMultipleFiles.js";
import ProcessMultipleFilesArrayOfObjects from "../Utils/ProcessMultipleFilesArrayOfObjects.js";
import HTMLspecialChars from "../Utils/HTMLspecialChars.js";
import GetUserDetailsFromHeader from "../Utils/GetUserDetailsFromHeader.js";
import updateResponseFilePathsWithHostName from "../Utils/updateResponseFilePathsWithHostName.js";
// adVideo = updateResponseFilePathsWithHostName(adVideo, HOST);
import retryACIDTransaction from "../Utils/RetryACIDTransaction.js"; // Import the retry utility
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";



// Paystack API details
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";
const serverPassword = process.env.SERVER_PASSWORD;

let HOST, AuthHOST, PaymentHOST;

// Set the appropriate HOST based on environment
const setHostConfig = () => {
  if (process.env.NODE_ENV === "development") {
    HOST = process.env.DEV_HOST;
    AuthHOST = process.env.DEV_AUTH_HOST;
    PaymentHOST = process.env.DEV_PAYMENT_HOST;
  } else if (
    process.env.NODE_ENV === "production" &&
    process.env.TestingForProduction === "true"
  ) {
    HOST = process.env.DEV_HOST;
    AuthHOST = process.env.DEV_AUTH_HOST;
    PaymentHOST = process.env.DEV_PAYMENT_HOST;
  } else {
    HOST = process.env.PROD_HOST;
    AuthHOST = process.env.AUTH_HOST;
    PaymentHOST = process.env.PAYMENT_HOST;
  }
};
setHostConfig();

const initializePaystackPayment = async (amount, email, reference) => {
  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    { amount: amount * 100, email, reference },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.data || response.data.status !== "success") {
    throw new Error("Paystack initialization failed");
  }
  return response.data.data.authorization_url;
};

export const DepositFund = async (req, res) => {
  const userID = req.user._id;
  const amount = req.body.amount;

  if (!userID || !amount) {
    return res
      .status(400)
      .json({ message: "User ID and amount are required." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create a pending transaction record
    const transaction = await Transaction.create(
      [
        {
          userID,
          amount,
          reference: `pay_${Date.now()}`,
          status: "pending",
          type: "deposit",
        },
      ],
      { session }
    );

    // Initialize payment with Paystack
    const paymentUrl = await initializePaystackPayment(
      amount,
      req.user.email,
      transaction[0].reference
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "success",
      paymentUrl,
      transactionReference: transaction[0].reference,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: "Failed to initialize payment." });
  }
};



// Webhook for Paystack Transaction Verification
export const paystackWebhookHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = req.body;

    if (event.event === "charge.success") {
      const { reference, amount } = event.data;

      const transaction = await Transaction.findOne({ reference }).session(
        session
      );
      if (!transaction || transaction.status !== "pending") {
        throw new Error("Transaction not found or already processed");
      }

      // Mark transaction as successful
      transaction.status = "successful";
      await transaction.save({ session });

      // Notify external service to update user balance
      await axios.post(
        `https://${PaymentHOST}/api/a/v1.00/balance/payin/${transaction.userID}`,
        {
          amount: transaction.amount,
        },
        {
          headers: {
            Authorization: `Server ${req.headers.authorization.split(" ")[1]}`,
            serverpassword: serverPassword,
            "Content-Type": "application/json",
          },
        }
      );

      await session.commitTransaction();
      session.endSession();

      return res
        .status(200)
        .json({ status: "Transaction verified and balance updated." });
    }

    throw new Error("Invalid event");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ status: "Transaction verification failed." });
  }
};


// Perform transfer function with user account details from UserAccount model
export const performTransfer = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch the user account details from the UserAccount model
    const userAccount = await UserAccount.findOne({ userId: req.user._id });
    if (!userAccount) {
      throw new Error("User account details not found.");
    }

    // Ensure the user has enough balance to perform the transfer
    const userBalanceServiceURL = `https://${PaymentHOST}/api/a/v1.00/balance/${req.user._id}`;
    const headers = {
      Authorization: `Server ${req.headers.authorization.split(" ")[1]}`,
      serverpassword: serverPassword,
    };

    const { data: userBalance } = await axios.get(userBalanceServiceURL, {
      headers,
    });
    if (!userBalance) {
      return next(new Error("This user balance record does not exist", 401));
    }

    if (userBalance.balance < req.body.amount) {
      throw new Error("Insufficient balance.");
    }

    // Create Paystack transfer recipient using user account details from UserAccount model
    const recipientResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transferrecipient`,
      {
        type: "nuban",
        name: userAccount.accountName, // Fetch from UserAccount model
        account_number: userAccount.accountNumber, // Fetch from UserAccount model
        bank_code: userAccount.bankCode, // Fetch from UserAccount model
        currency: userAccount.currency || "NGN", // Fetch from UserAccount model, default to NGN
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const recipientCode = recipientResponse.data.data.recipient_code;

    // Deduct the user's balance via the external service
    const deductBalanceResponse = await axios.post(
      `https://${PaymentHOST}/api/a/v1.00/balance/withdraw/${req.user._id}`,
      { amount: req.body.amount },
      { headers }
    );

    if (!deductBalanceResponse.data.success) {
      throw new Error("Failed to deduct balance.");
    }

    // Create a new transaction for the withdrawal
    const transaction = new Transaction({
      userId: req.user._id,
      amount: req.body.amount,
      type: "withdrawal",
      status: "pending",
      recipientCode,
    });
    await transaction.save({ session });

    // Execute the Paystack transfer
    const transferResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transfer`,
      {
        source: "balance",
        amount: req.body.amount * 100, // Convert amount to kobo
        recipient: recipientCode,
        reason: req.body.reason,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Update transaction status to completed and save transfer details
    transaction.status = "completed";
    transaction.transferData = transferResponse.data.data;
    await transaction.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    res.status(200).json({
      message: "Transfer successful",
      transaction,
    });
  } catch (error) {
    // Abort the transaction in case of failure
    await session.abortTransaction();
    console.error("Transfer failed:", error);
    res.status(500).json({ message: "Transfer failed", error: error.message });
  } finally {
    // End the session
    session.endSession();
  }
};



// Get transaction reference
export const getTransactionReference = async (req, res) => {
  const { reference } = req.params;

  try {
    const transaction = await Transaction.findOne({ reference });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    res.status(200).json({
      status: "success",
      transaction,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to retrieve transaction details." });
  }
};

// Exporting functions
export const getAllTransactions = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(Transaction.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .limitfields2()
    .paginate();

  // Execute the query and get the result
  let Transaction = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  console.log("RecordsEstimate", totalCount);

  res.status(200).json({
    status: "success",
    resource: "Transaction",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: Transaction.length,
    data: Transaction,
  });
});


export const getTransactions = asyncErrorHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params._id);
  if (!transaction) {
    const error = new CustomError(
      `transaction with ID: ${req.params._id} is not found`,
      404,
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "transaction",
    transaction: "created",
    length: transaction.length,
    data: transaction,
  });
});

export const patchTransaction = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars(req.body);
  const transaction = await Transaction.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!transaction) {
    const error = new CustomError(
      `Transaction with ID: ${req.params._id} is not found`,
      404,
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "transaction",
    action: "patch",
    length: transaction.length,
    data: transaction,
  });
});


export const putTransaction = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars(req.body);
  const transaction = await Transaction.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!transaction) {
    const error = new CustomError(
      `Transaction with ID: ${req.params._id} is not available`,
      404,
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "transaction",
    action: "put",
    length: transaction.length,
    data: transaction,
  });
});


export const deleteTransaction = asyncErrorHandler(async (req, res, next) => {
  const transaction = await Transaction.findByIdAndDelete(
    req.params._id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!transaction) {
    const error = new CustomError(
      `Transaction with ID: ${req.params._id} is not available`,
      404,
    );
    return next(error);
  }

  if (transaction.files) {
    UnlinkMultipleFiles(transaction.files, req);
  }

  res.status(204).json({
    status: "success",
    resource: "transaction",
    message: "deleted",
  });
});

