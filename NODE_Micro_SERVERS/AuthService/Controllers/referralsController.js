// Importing modules
import Referrals from "../Models/referrals.js";
import ApiFeatures from "../Utils/ApiFeatures.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import CustomError from "../Utils/CustomError.js";
import paginationCrossCheck from "../Utils/paginationCrossCheck.js";
import UnlinkMultipleFiles from "../Utils/UnlinkMultipleFiles.js";
import ProcessMultipleFilesArrayOfObjects from "../Utils/ProcessMultipleFilesArrayOfObjects.js";
import HTMLspecialChars from "../Utils/HTMLspecialChars.js";
import GetUserDetailsFromHeader from "../Utils/GetUserDetailsFromHeader.js";
import retryACIDTransaction from "../Utils/RetryACIDTransaction.js"; // Import the retry utility
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";

import getNextServerIndex from "../Utils/LoadBalancerManual.js";

// Exporting functions
export const getAllReferrals = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(Referrals.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .limitfields2()
    .paginate();

  // Execute the query and get the result
  let referrals = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  console.log("RecordsEstimate", totalCount);


  referrals = await Promise.all(
    referrals.map(async (data) => {
      data = limitUserDetailsServeFields(data);
      data = updateResponseFilePathsWithHostName(data, HOST);
      data = await decodeAndVerifyData(data);
      data = await limitEncDetaFromServe(data); // Verify the data data
      return data; // Return the verified data
    })
  );

  res.status(200).json({
    status: "success",
    resource: "referrals",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: referrals.length,
    data: referrals,
  });
});

export const getUserReferrals = asyncErrorHandler(async (req, res, next) => {
  console.log("req.user.referalID", req.user.referalID);
  let features = new ApiFeatures(
    Referrals.find({ userID: req.user._id }).populate("referred", "firstName middleName lastName userTitle"),
    req.query
  )
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .limitfields2()
    .paginate();
  

  // Execute the query and get the result
  let referrals = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  console.log("RecordsEstimate", totalCount);

    
    referrals = await Promise.all(
      referrals.map(async (data) => {
        data = await decodeAndVerifyData(data);
        data = await limitEncDetaFromServe(data); // Verify the data data
        return data; // Return the verified data
      })
    );

  res.status(200).json({
    status: "success",
    resource: "referrals",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: referrals.length,
    data: referrals,
  });
});


export const postReferrals = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  if (req.files) {
    let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
    req.body.files = filesArrayOfObjects;
  }

  const referrals = await Referrals.create(req.body);

  res.status(201).json({
    status: "success",
    resource: "referrals",
    referrals: "created",
    length: referrals.length,
    data: referrals,
  });
});


export const getReferral = asyncErrorHandler(async (req, res, next) => {
  const referrals = await Referrals.findById(req.params._id);
  if (!referrals) {
    const error = new CustomError(
      `referrals with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "referrals",
    action: "getOne",
    length: referrals.length,
    data: referrals,
  });
});


export const patchReferral = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  const referrals = await Referrals.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!referrals) {
    const error = new CustomError(
      `referrals with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "referrals",
    action: "patch",
    length: referrals.length,
    data: referrals,
  });
});


export const putReferral = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  const referrals = await Referrals.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!referrals) {
    const error = new CustomError(
      `referrals with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "referrals",
    action: "put",
    length: referrals.length,
    data: referrals,
  });
});


export const deleteReferral = asyncErrorHandler(async (req, res, next) => {
  const referrals = await Referrals.findByIdAndDelete(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!referrals) {
    const error = new CustomError(
      `referrals with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  if (referrals.files) {
    UnlinkMultipleFiles(Referrals.files, req);
  }

  res.status(204).json({
    status: "success",
    resource: "referrals",
    message: "deleted",
  });
});
