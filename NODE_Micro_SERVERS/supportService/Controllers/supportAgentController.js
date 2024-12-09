// Importing modules
import SupportAgent from "../Models/supportAgent.js";
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
import path from "path"; // to allow access to static files
import { fileURLToPath } from "url"; // Required to handle import.meta.url



// Exporting functions
export const getSupportAgents = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(SupportAgent.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .limitfields2()
    .paginate();

  // Execute the query and get the result
  let supportAgents = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  console.log("RecordsEstimate", totalCount);

  res.status(200).json({
    status: "success",
    resource: "supportAgents",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: supportAgents.length,
    data: supportAgents,
  });
});

export const postSupportAgent = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars(req.body);
  if (req.files) {
    let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
    req.body.files = filesArrayOfObjects;
  }

  const supportAgent = await SupportAgent.create(req.body);

  res.status(201).json({
    status: "success",
    resource: "supportAgents",
    supportAgent: "retrieved",
    length: supportAgent.length,
    data: supportAgent,
  });
});


export const getSupportAgent = asyncErrorHandler(async (req, res, next) => {
  const supportAgent = await SupportAgent.findById(req.params._id);
  if (!supportAgent) {
    const error = new CustomError(
      `SupportAgent with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "supportAgent",
    supportAgent: "retrieved",
    length: supportAgent.length,
    data: supportAgent,
  });
});


export const patchSupportAgent = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars(req.body);
  const supportAgent = await SupportAgent.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!supportAgent) {
    const error = new CustomError(
      `SupportAgent with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "supportAgent",
    action: "patch",
    length: supportAgent.length,
    data: supportAgent,
  });
});


export const putSupportAgent = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars(req.body);
  const supportAgent = await SupportAgent.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!supportAgent) {
    const error = new CustomError(
      `SupportAgent with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  res.status(200).json({
    status: "success",
    resource: "supportAgent",
    action: "put",
    length: supportAgent.length,
    data: supportAgent,
  });
});


export const deleteSupportAgent = asyncErrorHandler(async (req, res, next) => {
  const supportAgent = await SupportAgent.findByIdAndDelete(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!supportAgent) {
    const error = new CustomError(
      `SupportAgent with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  if (supportAgent.files) {
    UnlinkMultipleFiles(supportAgent.files, req);
  }

  res.status(204).json({
    status: "success",
    resource: "supportAgent",
    action: "delete",
    message: "deleted",
  });
});


export const filesTosupportAgent = asyncErrorHandler(async (req, res, next) => {
  SetUploadsfilePathHandler(req, `./uploads/supportAgent`);
  next();
});


