// Importing modules
import Balance from "../Models/balance.js";
import CoinMining from "../Models/coinMining.js";
import coinStatement from "../Models/coinStatement.js";
import ReferralBonuses from "../Models/referralBonuses.js";

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
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";

// Exporting functions
export const getBalances = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(Balance.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .limitfields2()
    .paginate();

  // Execute the query and get the result
  let balance = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  console.log("RecordsEstimate", totalCount);

    balance = await Promise.all(
      balance.map(async (data) => {
        data = await decodeAndVerifyData(data);
        data = await limitEncDetaFromServe(data); // Verify the data data
        return limiteddata; // Return the verified data
      })
  );
  
  res.status(200).json({
    status: "success",
    resource: "balance",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: balance.length,
    data: balance,
  });
});

export const getWithdrawableBalances = asyncErrorHandler(
  async (req, res, next) => {
    let features = new ApiFeatures(
      Balance.find({ TotalMoneyLeft: { $gte: 2 } }),
      req.query
    )
      .countDocuments()
      .filter()
      .sort()
      .limitfields()
      .limitfields2()
      .paginate();

    // Execute the query and get the result
    let balance = await features.query;

    // Get the total count of records
    let totalCount = await features.totalCountPromise;

    console.log("RecordsEstimate", totalCount);

  balance = await Promise.all(
    balance.map(async (data) => {
      data = await decodeAndVerifyData(data);
      data = await limitEncDetaFromServe(data); // Verify the data data
      return limiteddata; // Return the verified data
    })
  );
    res.status(200).json({
      status: "success",
      resource: "balance",
      RecordsEstimate: totalCount,
      action: "getAll",
      length: balance.length,
      data: balance,
    });
  }
);

export const getNotWithdrawableBalances = asyncErrorHandler(
  async (req, res, next) => {
    let features = new ApiFeatures(
      Balance.find({ TotalMoneyLeft: { $lt: 2 } }),
      req.query
    )
      .countDocuments()
      .filter()
      .sort()
      .limitfields()
      .limitfields2()
      .paginate();

    // Execute the query and get the result
    let balance = await features.query;

    // Get the total count of records
    let totalCount = await features.totalCountPromise;

    console.log("RecordsEstimate", totalCount);

  balance = await Promise.all(
    balance.map(async (data) => {
      data = await decodeAndVerifyData(data);
      data = await limitEncDetaFromServe(data); // Verify the data data
      return limiteddata; // Return the verified data
    })
  );

    res.status(200).json({
      status: "success",
      resource: "balance",
      RecordsEstimate: totalCount,
      action: "getAll",
      length: balance.length,
      data: balance,
    });
  }
);

export const getUserBalance = asyncErrorHandler(async (req, res, next) => {
  try {
    // Fetch balance for the user
    let balance = await Balance.findOne({ userID: req.user._id });


    
    // If no balance is found, return an empty object
    if (!balance) {
      return res.status(200).json({
        status: "success",
        resource: "balance",
        action: "retrieved",
        length: 0,
        data: {}, // Return an empty object when no balance is found
      });
    }

    console.log("balance b4 Decode", balance);
    balance = await decodeAndVerifyData(balance);
    console.log("balance after Decode", balance);
    
        balance = await limitEncDetaFromServe(balance);
    // If balance is found, return the balance information
    res.status(200).json({
      status: "success",
      resource: "balance",
      action: "retrieved",
      length: 1, // length is 1 if balance is found
      data: balance,
    });
  } catch (error) {
    // Handle any errors during execution
    next(new CustomError("Error retrieving balance", 500));
  }
});

export const postUserBalance = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  if (req.files) {
    let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
    req.body.files = filesArrayOfObjects;
  }

  const balance = await Balance.create(req.body);

  res.status(201).json({
    status: "success",
    resource: "balance",
    balance: "retrieved",
    length: balance.length,
    data: balance,
  });
});

export const getOneBalance = asyncErrorHandler(async (req, res, next) => {
  let balance = await Balance.findOne({ userID: req.params._id });

  if (!balance) {
    return res.status(404).json({
      message:
        "Balance not found,\n Welcome new user, \nPlease complete a task",
    });
  }

  balance = await decodeAndVerifyData(balance);
  balance = await limitEncDetaFromServe(balance);

  res.status(200).json({
    status: "success",
    resource: "balance",
    balance: "retrieved",
    length: balance.length,
    data: balance,
  });
});

export const patchOneBalance = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  const balance = await Balance.findOneAndUpdate(
    { userID: req.params._id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  findOne({ userID: req.params._id });
  if (!balance) {
    const error = new CustomError(
      `Balance with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  balance = await limitEncDetaFromServe(balance);
  res.status(200).json({
    status: "success",
    resource: "balance",
    action: "patch",
    length: balance.length,
    data: balance,
  });
});

export const putOneBalance = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  const balance = await Balance.findOneAndUpdate(
    { userID: req.params._id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!balance) {
    const error = new CustomError(
      `Balance with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

  balance = await limitEncDetaFromServe(balance);
  res.status(200).json({
    status: "success",
    resource: "balance",
    action: "patch",
    length: balance.length,
    data: balance,
  });
});

export const withdrawFromBalance = asyncErrorHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let balance = await Balance.findOne({ userID: req.user._id }).session(
      session
    );
    if (!balance) {
      balance = new Balance({
        userID: req.user._id,
        month: numberedMonth,
      });
    }

    balance = await decodeAndVerifyData(balance);

    const newCoins = 0; // Replace with your logic for new coins
    const statementData = {
      userID: req.user._id,
      transaction: "withdraw",
      oldBalance: balance.TotalMoneyLeft,
      amount: req.body.amount,
      newBalance: balance.TotalMoneyLeft - req.body.amount,
      oldTBV_Coins: balance.TotalCoinsTobeValued,
      totalValuedCoins: 0,
      valuedSum: 0,
      valuedAt: 0,
      newTBV_Coins: balance.TotalCoinsTobeValued,
      oldCoins: balance.TotalCurrentCoins,
      minedCoins: newCoins,
      newCoins: balance.TotalCurrentCoins,
      month: numberedMonth,
    };

    let statement = {
      ...statementData,
    };

    balance.TotalMainCoins = statement.newCoins;
    balance.TotalBonusCoins = balance.TotalBonusCoins;
    balance.TotalCurrentCoins =
      balance.TotalMainCoins + balance.TotalBonusCoins;
    balance.TotalCoinsTobeValued = statement.newTBV_Coins;
    balance.TotalMoneyLeft = balance.TotalMoneyLeft + req.body.amount;
    balance.month = numberedMonth;

    await coinStatement.create([statement], { session });
    await balance.save({ session });

    statement = await limitEncDetaFromServe(statement);

    res.status(201).json({
      status: "success",
      resource: "coinsMining",
      action: "created",
      data: statement,
    });
  } catch (error) {
    await session.abortTransaction();
    next(new CustomError(error.message, error.statusCode || 500));
  } finally {
    session.endSession();
  }
});

export const PayInToBalance = asyncErrorHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let balance = await Balance.findOne({ userID: req.user._id }).session(
      session
    );
    if (!balance) {
      balance = new Balance({
        userID: req.user._id,
        month: numberedMonth,
      });
    }
    balance = await decodeAndVerifyData(balance);

    const newCoins = 0; // Replace with your logic for new coins
    const statementData = {
      userID: req.user._id,
      transaction: "deposit",
      oldBalance: balance.TotalMoneyLeft,
      amount: req.body.amount,
      newBalance: balance.TotalMoneyLeft + req.body.amount,
      oldTBV_Coins: balance.TotalCoinsTobeValued,
      totalValuedCoins: 0,
      valuedSum: 0,
      valuedAt: 0,
      newTBV_Coins: balance.TotalCoinsTobeValued,
      oldCoins: balance.TotalCurrentCoins,
      minedCoins: newCoins,
      newCoins: balance.TotalCurrentCoins,
      month: numberedMonth,
    };

    let statement = {
      ...statementData,
    };

    balance.TotalMainCoins = statement.newCoins;
    balance.TotalBonusCoins = balance.TotalBonusCoins;
    balance.TotalCurrentCoins =
      balance.TotalMainCoins + balance.TotalBonusCoins;
    balance.TotalCoinsTobeValued = statement.newTBV_Coins;
    balance.TotalMoneyLeft = balance.TotalMoneyLeft + req.body.amount;
    balance.month = numberedMonth;

    await coinStatement.create([statement], { session });
    await balance.save({ session });

    statement = await limitEncDetaFromServe(statement);
    res.status(201).json({
      status: "success",
      resource: "coinsMining",
      action: "created",
      data: statement,
    });
  } catch (error) {
    await session.abortTransaction();
    next(new CustomError(error.message, error.statusCode || 500));
  } finally {
    session.endSession();
  }
});
