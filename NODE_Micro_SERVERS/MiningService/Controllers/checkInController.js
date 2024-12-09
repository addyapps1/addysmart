// Importing modules
import CheckIn from "../Models/checkin.js";
import Balance from "../Models/balance.js";
import CoinStatement from "../Models/coinStatement.js";
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

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const currentDay = currentDate.getDate();
const currentHours = currentDate.getHours();
const currentMinutes = currentDate.getMinutes();
const currentSeconds = currentDate.getSeconds();
const currentMilliseconds = currentDate.getMilliseconds();

const encryptData = (data) => {
  return SymmetricEncryption.encryptData(
    data,
    process.env.ENCRYPTIONKEY,
    process.env.IV
  );
};

let nunberedMonth = +`${currentYear}${currentMonth}${currentDay}`;

// Exporting functions
export const getCheckIns = asyncErrorHandler(
  async (req, res, next) => {
    let features = new ApiFeatures(CheckIn.find(), req.query)
      .countDocuments()
      .filter()
      .sort()
      .limitfields()
      .limitfields2()
      .paginate();

    // Execute the query and get the result
    let checkIn = await features.query;

    // Get the total count of records
    let totalCount = await features.totalCountPromise;

    console.log("RecordsEstimate", totalCount);

      checkIn = await Promise.all(
        checkIn.map(async (data) => {
          data = await decodeAndVerifyData(data);
          data = await limitEncDetaFromServe(data); // Verify the data data
          return data; // Return the verified data
        })
      );

    res.status(200).json({
      status: "success",
      resource: "checkIn",
      RecordsEstimate: totalCount,
      action: "getAll",
      length: checkIn.length,
      data: checkIn,
    });
  }
);

export const postCheckIn = asyncErrorHandler(async (req, res, next) => {
  // Sanitize request body to prevent HTML injection
  req.body = HTMLspecialChars(req.body);

  // Start a MongoDB session and transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Process files if they exist in the request
    if (req.files) {
      const filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
      req.body.files = filesArrayOfObjects;
    }

    req.body.userID = req.user.id;
    req.body.coins = 10;
    const coinsMining = await CheckIn.create([req.body], { session }); // Pass session for transaction

    const balance = await Balance.findById({ userID: req.user.id });
    if (!balance) {
      balance.userID = req.user.id;
      balance.month = nunberedMonth;
    }

    //REFERRAL BONUS
    let NewBonus = {};
    NewBonus.userId = req.user._id;
    NewBonus.referral = req.user.referred;
    NewBonus.miningID = coinsMining._id;
    NewBonus.miningResource = "checkin";
    NewBonus.bonus = newCoins * (10 / 100); // 10 percent
    NewBonus.month = nunberedMonth;

    bonusData = {
      userId: req.user._id,
      referral: req.user.referred,
      miningID: coinsMining._id,
      miningResource: "checkin",
      bonus: newCoins * (10 / 100), // 10 percent
      month: nunberedMonth,
    };
    // NewBonus.encData: SymmetricEncryption.encryptData(plainText, encryptionKey, iv)
    NewBonus.encData = encryptData(bonusData);

    //STATEMENT
    let statement = {};
    statement.userID = req.user.id;
    statement.transaction = "mining";
    statement.oldBalance = balance.TotalMoneyLeft;
    statement.withhdrawn = 0;
    statement.newBalance = balance.TotalMoneyLeft - statement.withhdrawn;
    statement.oldTBV_Coins = balance.TotalCoinsTobeValued;
    statement.totalValuedCoins = 0;
    statement.valuedSum = 0;
    statement.valuedAt = 0;
    statement.newTBV_Coins =
      balance.TotalCoinsTobeValued - statement.totalValuedCoins;
    statement.oldCoins = balance.TotalCurrentCoins;
    statement.minedCoins = newCoins;
    statement.newCoins = balance.TotalCurrentCoins + newCoins;
    statement.month = nunberedMonth;

    let statementData = {
      userID: statement.userID,
      transaction: statement.transaction,
      oldBalance: statement.oldBalance,
      withhdrawn: statement.withhdrawn,
      newBalance: statement.newBalance,
      oldTBV_Coins: statement.oldTBV_Coins,
      totalValuedCoins: statement.totalValuedCoins,
      valuedSum: statement.valuedSum,
      valuedAt: statement.valuedAt,
      newTBV_Coins: statement.newTBV_Coins,
      oldCoins: statement.oldCoins,
      minedCoins: statement.minedCoins,
      newCoins: statement.newCoins,
      month: statement.month,
    };

    statement.encData = encryptData(statementData);

    //BALANCE
    balance.TotalMainCoins = statement.newCoins;
    balance.TotalBonusCoins = balance.TotalBonusCoins + NewBonus.bonus;
    balance.TotalCurrentCoins =
      balance.TotalMainCoins + balance.TotalBonusCoins;
    balance.TotalCoinsTobeValued = statement.newTBV_Coins;
    balance.TotalMoneyLeft = statement.newBalance;
    balance.month = nunberedMonth;

    let balanceData = {
      TotalCurrentCoins: balance.TotalCurrentCoins,
      TotalCoinsTobeValued: balance.TotalCoinsTobeValued,
      TotalBonusCoins: balance.TotalBonusCoins,
      TotalMainCoins: balance.TotalMainCoins,
      TotalMoneyLeft: balance.TotalMoneyLeft,
      month: balance.month,
    };

    balance.encData = encryptData(balanceData);

    const newcoinStatement = await CoinStatement.create(statement, { session });
    const newBonusRecord = await ReferralBonuses.create(NewBonus, { session });
    // await balance.save({ validateBeforeSave: false });
    // await balance.save({ validateBeforeSave: true });
    await balance.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    // Send a success response
    return res.status(201).json({
      status: "success",
      resource: "checkin",
      action: "created",
      length: coinsMining.length,
      data: coinsMining,
    });
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();

    // Send an error response
    return res.status(400).send({ error: error.message });
  } finally {
    session.endSession(); // End the session
  }
});

export const getCheckIn = asyncErrorHandler(async (req, res, next) => {
  let checkIn = await CheckIn.findById(req.params._id);
  if (!checkIn) {
    const error = new CustomError(
      `CheckIn with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }

    checkIn = await decodeAndVerifyData(checkIn);
    checkIn = await limitEncDetaFromServe(checkIn);

  res.status(200).json({
    status: "success",
    resource: "checkIn",
    action: "getOne",
    length: checkIn.length,
    data: checkIn,
  });
});
