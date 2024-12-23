// Importing modules
import mongoose from "mongoose";
import Referral from "../Models/referrals.js"; // Adjust the path as necessary
import ReferralTask from "../Models/referralTask.js";
import User from "../Models/userModel.js";
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";

import ApiFeatures from "../Utils/ApiFeatures.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import CustomError from "../Utils/CustomError.js";
import paginationCrossCheck from "../Utils/paginationCrossCheck.js";
import UnlinkMultipleFiles from "../Utils/UnlinkMultipleFiles.js";
import ProcessMultipleFilesArrayOfObjects from "../Utils/ProcessMultipleFilesArrayOfObjects.js";
import HTMLspecialChars from "../Utils/HTMLspecialChars.js";
import GetUserDetailsFromHeader from "../Utils/GetUserDetailsFromHeader.js";
import retryACIDTransaction from "../Utils/RetryACIDTransaction.js"; // Import the retry utility
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";

import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

// Encrypt data function with secure key/IV validation
const encryptData = (data) => {
  const encryptionKey = process.env.ENCRYPTIONKEY;
  const iv = process.env.IV;

  if (!encryptionKey || !iv) {
    throw new Error("Encryption key or IV is missing");
  }

  return SymmetricEncryption.encryptData(data, encryptionKey, iv);
};

// Function to check if a user is a VIP partner
export async function checkVIPStatus(userID, superReferredUID) {
  console.log("userID", userID);
  try {
    // Fetch all referrals made by the user
    const referralCount = await Referral.countDocuments({ userID });
    // Count completed tasks with referralID matching userID
    const qualifiedCount = await ReferralTask.countDocuments({
      referralID: userID,
      completed: true,
    });

    console.log("Total Referrals:", referralCount);
    console.log("Referrals with Completed Tasks:", qualifiedCount);

    // Check if the referral task already exists for this user
    let task = await ReferralTask.findOne({ userID });

    if (!task) {
      // Create new ReferralTask if not found
      task = new ReferralTask({
        userID,
        referralID: superReferredUID,
        totalReferrals: referralCount,
        qualifiedReferrals: qualifiedCount,
        completed: referralCount >= 5, // Setting completed field
      });
    } else {
      // Update existing task details
      task.totalReferrals = referralCount;
      task.qaulifiedReferrals = qualifiedCount;
      task.completed = referralCount >= 5; // Update the completed field
    }

    // Save the updated or new ReferralTask
    await task.save();

    // Return true if the user qualifies as VIP (at least 10 qualified referrals)
    return qualifiedCount >= 10;
  } catch (error) {
    console.error("Error checking VIP status:", error);
    throw new Error("Failed to check VIP status");
  }
}

// Function to manage referral tasks during user sign-up
export async function manageReferralTask(
  userID,
  referredByID,
  referralID,
  superReferredUID
) {
  try {
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userID))
      throw new Error("Invalid user ID");
    if (!mongoose.Types.ObjectId.isValid(referredByID))
      throw new Error("Invalid referred by ID");

    // Check if referral exists
    let referral = await Referral.findOne({ referred: userID });

    if (!referral) {
      // Create a new referral if not found
      console.log("creating new referral ");
      referral = new Referral({
        userID: referredByID,
        referred: userID,
        referralId: referralID,
        encData: encryptData({ userID, referred: referredByID }),
        releaseDate: Date.now(),
        created: Date.now(),
      });
      await referral.save();
      console.log("New referral created.");
    } else {
      // Update existing referral
      referral.userID = referredByID;
      referral.updated = Date.now();
      await referral.save();
      console.log("Referral updated.");
    }

    // Check VIP status
    const isVIP = await checkVIPStatus(referredByID, superReferredUID);
    if (isVIP) {
      console.log(`User ${referredByID} is now a VIP partner!`);
    }

    return {
      success: true,
      message: "Referral task managed successfully",
      isVIP,
    };
  } catch (error) {
    console.error("Error managing referral task:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}
export default manageReferralTask;

// Named exports for other referral task-related functions

// Get all referral tasks
export const getAllReferralTask = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(ReferralTask.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .paginate();

  const referralTask = await features.query;
  const totalCount = await features.totalCountPromise;

  console.log("RecordsEstimate", totalCount);

  referralTask = await Promise.all(
    referralTask.map(async (data) => {
      data = limitUserDetailsServeFields(data);
      data = updateResponseFilePathsWithHostName(data, HOST);
      data = await decodeAndVerifyData(data);
      data = await limitEncDetaFromServe(data); // Verify the data data
      return data; // Return the verified data
    })
  );

  res.status(200).json({
    status: "success",
    resource: "ReferralTask",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: referralTask.length,
    data: referralTask,
  });
});


// Get a specific referral task for a referral
export const getMyRefReferralTask = asyncErrorHandler(async (req, res, next) => {
  console.log("Fetching referral task for user:",  req.params._id);

  let referralTask = await ReferralTask.findOne({ userID: req.params._id });

  if (!referralTask) {
    const error = new CustomError(
      `ReferralTask for user with ID: ${req.params._id} not found`,
      404
    );
    return next(error);
  }

  referralTask = await decodeAndVerifyData(referralTask);
  referralTask = await limitEncDetaFromServe(referralTask); // Verify the data data

   console.log("result referral task for user:", referralTask);
  res.status(200).json({
    status: "success",
    resource: "ReferralTask",
    action: "getOne",
    data: referralTask,
  });
});

// Get a specific referral task for a user
export const getReferralTask = asyncErrorHandler(async (req, res, next) => {
  console.log("Fetching referral task for user:", req.user._id);

  let referralTask = await ReferralTask.findOne({ userID: req.user._id });

  if (!referralTask) {
    const error = new CustomError(
      `ReferralTask for user with ID: ${req.user._id} not found`,
      404
    );
    return next(error);
  }

  referralTask = await decodeAndVerifyData(referralTask);
  referralTask = await limitEncDetaFromServe(referralTask); // Verify the data data

   console.log("result referral task for user:", referralTask);
  res.status(200).json({
    status: "success",
    resource: "ReferralTask",
    action: "getOne",
    data: referralTask,
  });
});

// Delete a referral task
export const deleteReferralTask = asyncErrorHandler(async (req, res, next) => {
  const referralTask = await ReferralTask.findByIdAndDelete(
    req.params._id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!referralTask) {
    const error = new CustomError(
      `ReferralTask with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  if (referralTask.files) {
    UnlinkMultipleFiles(ReferralTask.files, req);
  }

  res.status(204).json({
    status: "success",
    resource: "ReferralTask",
    message: "deleted",
  });
});
