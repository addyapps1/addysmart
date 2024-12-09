// Importing modules
import CoinStatement from "../Models/coinStatement.js";
import Balance from "../Models/balance.js";
import CoinMining from "../Models/coinMining.js";
import ReferralBonuses from "../Models/referralBonuses.js";

import ApiFeatures from "../Utils/ApiFeatures.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import CustomError from "../Utils/CustomError.js";
import paginationCrossCheck from "../Utils/paginationCrossCheck.js";
import UnlinkMultipleFiles from "../Utils/UnlinkMultipleFiles.js";
import ProcessMultipleFilesArrayOfObjects from "../Utils/ProcessMultipleFilesArrayOfObjects.js";
import HTMLspecialChars from "../Utils/HTMLspecialChars.js";
import GetUserDetailsFromHeader from "../Utils/GetUserDetailsFromHeader.js";
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";

// Exporting functions
export const getCoinStatements = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(CoinStatement.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .limitfields2()
    .paginate();

  // Execute the query and get the result
  let coinStatement = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  console.log("RecordsEstimate", totalCount);

  coinStatement = await Promise.all(
    coinStatement.map(async (data) => {
      data = await decodeAndVerifyData(data);
      data = await limitEncDetaFromServe(data); // Verify the data data
      return data; // Return the verified data
    })
  );

  res.status(200).json({
    status: "success",
    resource: "coinStatement",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: coinStatement.length,
    data: coinStatement,
  });
});

export const postCoinStatement = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  if (req.files) {
    let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
    req.body.files = filesArrayOfObjects;
  }

  const coinStatement = await CoinStatement.create(req.body);

  res.status(201).json({
    status: "success",
    resource: "coinStatement",
    action: "created",
    length: coinStatement.length,
    data: coinStatement,
  });
});

export const getCoinStatement = asyncErrorHandler(async (req, res, next) => {
  let coinStatement = await CoinStatement.findById(req.params._id);
  if (!coinStatement) {
    const error = new CustomError(
      `CoinStatement with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  coinStatement = await decodeAndVerifyData(coinStatement);
  coinStatement = await limitEncDetaFromServe(coinStatement);

  res.status(200).json({
    status: "success",
    resource: "coinStatement",
    action: "getOne",
    length: coinStatement.length,
    data: coinStatement,
  });
});

export const patchCoinStatement = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  const coinStatement = await CoinStatement.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!coinStatement) {
    const error = new CustomError(
      `CoinStatement with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  coinStatement = await limitEncDetaFromServe(coinStatement);
  res.status(200).json({
    status: "success",
    resource: "coinStatement",
    action: "patch",
    length: coinStatement.length,
    data: coinStatement,
  });
});

export const putCoinStatement = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  const coinStatement = await CoinStatement.findByIdAndUpdate(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!coinStatement) {
    const error = new CustomError(
      `CoinStatement with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  coinStatement = await limitEncDetaFromServe(coinStatement);

  res.status(200).json({
    status: "success",
    resource: "coinStatement",
    action: "put",
    length: coinStatement.length,
    data: coinStatement,
  });
});

export const deleteCoinStatement = asyncErrorHandler(async (req, res, next) => {
  const coinStatement = await CoinStatement.findByIdAndDelete(
    req.params._id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!coinStatement) {
    const error = new CustomError(
      `CoinStatement with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  if (coinStatement.files) {
    UnlinkMultipleFiles(coinStatement.files, req);
  }

  res.status(204).json({
    status: "success",
    resource: "coinStatement",
    message: "deleted",
  });
});
