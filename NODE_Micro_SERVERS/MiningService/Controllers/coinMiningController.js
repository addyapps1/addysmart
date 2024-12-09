// Importing modules
import CoinsMining from "../Models/coinMining.js";
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
import mongoose from "mongoose"; // Import mongoose if you're using transactions
import axios from "axios"; // Import axios for making external API calls
import retryACIDTransaction from "../Utils/RetryACIDTransaction.js"; // Import the retry utility
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";

import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

// Get the current date information
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const currentDay = currentDate.getDate();
const currentHours = currentDate.getHours();
const currentMinutes = currentDate.getMinutes();
const currentSeconds = currentDate.getSeconds();
const currentMilliseconds = currentDate.getMilliseconds();

let HOST, AuthHOST, E_VideoHOST, ORGUSERiD;
// Set the appropriate HOST based on environment
if (process.env.NODE_ENV === "development") {
  HOST = process.env.DEV_HOST;
  AuthHOST = process.env.DEV_AUTH_HOST;
  E_VideoHOST = process.env.DEV_E_VIDEO_HOST;
  ORGUSERiD = process.env.ORGUSERID_DEV;
} else if (
  process.env.NODE_ENV === "production" &&
  process.env.TestingForProduction === "true"
) {
  HOST = process.env.DEV_HOST;
  AuthHOST = process.env.DEV_AUTH_HOST;
  E_VideoHOST = process.env.DEV_E_VIDEO_HOST;
  ORGUSERiD = process.env.ORGUSERID_DEV;
} else {
  HOST = process.env.PROD_HOST;
  AuthHOST = process.env.AUTH_HOST;
  E_VideoHOST = process.env.E_VIDEO_HOST;
  ORGUSERiD = process.env.ORGUSERID;
}

// Function to encrypt data
const encryptData = (data) => {
  return SymmetricEncryption.encryptData(
    data,
    process.env.ENCRYPTIONKEY,
    process.env.IV
  );
};

// Create a numbered month format

let numberedMonth = +`${currentYear}${currentMonth}`;
let numberedDay = +`${currentYear}${currentMonth}${currentDay}`;
const serverPassword = process.env.SERVER_PASSWORD;

// Exporting functions
export const getCoinMinings = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(CoinsMining.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .limitfields2()
    .paginate();

  // Execute the query and get the result
  let coinsMining = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  coinsMining = await Promise.all(
    coinsMining.map(async (data) => {
      data = await decodeAndVerifyData(data);
      data = await limitEncDetaFromServe(data); // Verify the data data
      return data; // Return the verified data
    })
  );

  res.status(200).json({
    status: "success",
    resource: "coinsMining",
    RecordsEstimate: totalCount,
    action: "getAll",
    length: coinsMining.length,
    data: coinsMining,
  });
});

// export const postCoinMining = asyncErrorHandler(async (req, res, next) => {
//   console.log("RESPONS OK")
//   res.status(200).json({
//     status: "success",
//     resource: "coinsMining",
//   });
// });



const stageShares = async (userId, ORGUSERiD, referredUID) => {
  let ret;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    let balance = await Balance.findOne({ userID: userId }).session(session);
    if (!balance) {
      balance = await Balance.create(
        [
          {
            userID: userId, // Directly using reqUserId
            TotalMainCoins: 0,
            TotalBonusCoins: 0,
            TotalCurrentCoins: 0,
            TotalCoinsTobeValued: 0,
            TotalMoneyLeft: 0,
            month: numberedMonth,
            dailyMainCoins: 0,
            dailyBonusCoins: 0,
            dailyCurrentCoins: 0,
            dailyTaskCompleted: 0,
            encData: "new",
          },
        ],
        { session }
      );
    }

    console.log("balance x.userID", balance.userID);
    let lastTargetTaskCompleted = 0;
    let lastTargetLoss = 0;
    let OrgBalance = {};
    if (balance.month != numberedMonth || balance.Day != numberedDay) {
      if (balance.Day != numberedDay && balance.userID === ORGUSERiD) {
        if (balance.dailyTaskCompleted < 10) {
          // remove the bonus from user bunus and add it ORGUSER
          lastTargetLoss = balance.dailyBonusCoins;
          balance.dailyTaskCompleted = 0;
          balance.TotalLostBonus = balance.TotalLostBonus + lastTargetLoss;
          balance.TotalBonusCoins = balance.TotalBonusCoins - lastTargetLoss;

          ////////////
          // Fetch or create user orgbalance
          OrgBalance = await Balance.findOne({ userID: ORGUSERiD }).session(
            session
          );
          if (!OrgBalance) {
            OrgBalance = await Balance.create({
              userID: ORGUSERiD,
              TotalMainCoins: 0,
              TotalBonusCoins: 0,
              TotalCurrentCoins: 0,
              TotalCoinsTobeValued: 0,
              TotalMoneyLeft: 0,
              TotalLostBonus: 0,
              month: numberedMonth,
              dailyMainCoins: 0,
              dailyBonusCoins: 0,
              dailyCurrentCoins: 0,
              dailyTaskCompleted: 0,
              encData: "new",
            });
          }

          OrgBalance = await decodeAndVerifyData(OrgBalance);
          OrgBalance.dailyWonBonus = OrgBalance.dailyWonBonus + lastTargetLoss;
          OrgBalance.TotalWonBonus = OrgBalance.TotalWonBonus + lastTargetLoss;

          if (OrgBalance.month != numberedMonth) {
            //Stage the coins/shares
            OrgBalance.TotalCoinsTobeValued =
              OrgBalance.TotalCoinsTobeValued +
              OrgBalance.TotalCurrentCoins +
              OrgBalance.TotalWonBonus;
            OrgBalance.TotalWonBonus = 0;
            OrgBalance.dailyWonBonus = 0;
            OrgBalance.TotalMainCoins = 0;
            OrgBalance.TotalBonusCoins = 0;
            OrgBalance.TotalCurrentCoins = 0;
            OrgBalance.TotalMoneyLeft = OrgBalance.TotalMoneyLeft;
            OrgBalance.month = numberedMonth;
            OrgBalance.Day = numberedDay;
            OrgBalance.wonmonth = numberedMonth;
            OrgBalance.wonDay = numberedDay;
            OrgBalance.dailyMainCoins = 0;
            OrgBalance.dailyBonusCoins = 0;
            OrgBalance.dailyCurrentCoins = 0;
            OrgBalance.dailyTaskCompleted = 0;
          }
          if (userId != ORGUSERiD) {
            await OrgBalance.save({ session });
          }
        }

        lastTargetTaskCompleted = balance.dailyTaskCompleted;

        balance.Day = numberedDay;
        balance.dailyMainCoins = 0;
        balance.dailyBonusCoins = 0;
        balance.dailyCurrentCoins = 0;
        balance.dailyTaskCompleted = 0;
      }

      if (balance.month != numberedMonth) {
        //Stage the coins/shares
        balance.TotalCoinsTobeValued =
          balance.TotalCoinsTobeValued +
          balance.TotalCurrentCoins +
          balance.TotalWonBonus;
        balance.TotalWonBonus = 0;
        balance.dailyWonBonus = 0;
        balance.TotalMainCoins = 0;
        balance.TotalBonusCoins = 0;
        balance.TotalCurrentCoins = 0;
        balance.TotalMoneyLeft = balance.TotalMoneyLeft;
        balance.month = numberedMonth;
        balance.wonmonth = numberedMonth;
        balance.Day = numberedDay;
        balance.wonDay = numberedDay;
        balance.dailyMainCoins = 0;
        balance.dailyBonusCoins = 0;
        balance.dailyCurrentCoins = 0;
        balance.dailyTaskCompleted = 0;
      }
    }

    ///////

    ////////////

    // RefBalance
    // Fetch or create user balance
    let refBalance;
    if (referredUID == ORGUSERiD) {
      refBalance = null;
    } else {
      refBalance = await Balance.findOne({
        userID: referredUID,
      }).session(session);
    }

    if (!refBalance && referredUID !== ORGUSERiD) {
      refBalance = await Balance.create({
        userID: req.user.referredUID,
        TotalMainCoins: 0,
        TotalBonusCoins: 0,
        TotalCurrentCoins: 0,
        TotalCoinsTobeValued: 0,
        TotalMoneyLeft: 0,
        TotalTaskCompleted: 0,
        month: numberedMonth,
        dailyMainCoins: 0,
        dailyBonusCoins: 0,
        dailyCurrentCoins: 0,
        dailyTaskCompleted: 0,
        encData: "new",
      });
    }
    console.log("RESPONS OK2");

    if (refBalance.encData != "new") {
      refBalance = await decodeAndVerifyData(refBalance);
    }
    

    /////////
    let lastTargetLossRef = 0;

    if (referredUID !== ORGUSERiD) {
      if (refBalance.month != numberedMonth || refBalance.Day != numberedDay) {
        if (refBalance.Day != numberedDay && refBalance.userID === ORGUSERiD) {
          if (refBalance.dailyTaskCompleted < 10) {
            // remove the bonus from user bunus and add it ORGUSER
            lastTargetLossRef = refBalance.dailyBonusCoins;
            refBalance.dailyTaskCompleted = 0;
            refBalance.TotalBonusCoins =
              refBalance.TotalBonusCoins - lastTargetLossRef;

            // Fetch or create user refBalance
            if (!OrgBalance) {
              OrgBalance = await Balance.findOne({ userID: ORGUSERiD }).session(
                session
              );
            }
            if (!OrgBalance) {
              OrgBalance = new Balance({
                userID: ORGUSERiD,
                TotalMainCoins: 0,
                TotalBonusCoins: 0,
                TotalCurrentCoins: 0,
                TotalCoinsTobeValued: 0,
                TotalMoneyLeft: 0,
                month: numberedMonth,
                dailyMainCoins: 0,
                dailyBonusCoins: 0,
                dailyCurrentCoins: 0,
                dailyTaskCompleted: 0,
                encData: "new",
              });
            }
            
            if (OrgBalance.encData != "new") {
              OrgBalance = await decodeAndVerifyData(OrgBalance);
            }
            OrgBalance.dailyWonBonus =
              OrgBalance.dailyWonBonus + lastTargetLossRef;
            OrgBalance.TotalWonBonus =
              OrgBalance.TotalWonBonus + lastTargetLossRef;

            if (OrgBalance.month != numberedMonth) {
              //Stage the coins/shares
              OrgBalance.TotalCoinsTobeValued =
                OrgBalance.TotalCoinsTobeValued +
                OrgBalance.TotalCurrentCoins +
                OrgBalance.TotalWonBonus;
              OrgBalance.TotalWonBonus = 0;
              OrgBalance.dailyWonBonus = 0;
              OrgBalance.TotalMainCoins = 0;
              OrgBalance.TotalBonusCoins = 0;
              OrgBalance.TotalCurrentCoins = 0;
              OrgBalance.TotalTaskCompleted = 0;
              OrgBalance.TotalMoneyLeft = OrgBalance.TotalMoneyLeft;
              OrgBalance.month = numberedMonth;
              OrgBalance.Day = numberedDay;
              OrgBalance.wonmonth = numberedMonth;
              OrgBalance.wonDay = numberedDay;
              OrgBalance.dailyMainCoins = 0;
              OrgBalance.dailyBonusCoins = 0;
              OrgBalance.dailyCurrentCoins = 0;
              OrgBalance.dailyTaskCompleted = 0;
            }
          }
          refBalance.Day = numberedDay;
          refBalance.dailyMainCoins = 0;
          refBalance.dailyBonusCoins = 0;
          refBalance.dailyCurrentCoins = 0;
          refBalance.dailyTaskCompleted = 0;
        }

        if (refBalance.month != numberedMonth) {
          //Stage the coins/shares
          refBalance.TotalCoinsTobeValued =
            refBalance.TotalCoinsTobeValued +
            refBalance.TotalCurrentCoins +
            refBalance.TotalWonBonus;
          refBalance.TotalWonBonus = 0;
          refBalance.dailyWonBonus = 0;
          refBalance.TotalMainCoins = 0;
          refBalance.TotalBonusCoins = 0;
          refBalance.TotalCurrentCoins = 0;
          refBalance.TotalTaskCompleted = 0;
          refBalance.TotalMoneyLeft = refBalance.TotalMoneyLeft;
          refBalance.month = numberedMonth;
          refBalance.wonmonth = numberedMonth;
          refBalance.Day = numberedDay;
          refBalance.wonDay = numberedDay;
          refBalance.dailyMainCoins = 0;
          refBalance.dailyBonusCoins = 0;
          refBalance.dailyCurrentCoins = 0;
          refBalance.dailyTaskCompleted = 0;
        }
      }
    }

    ///////

    if (refBalance.userID != balance.userID && refBalance.length) {
      await refBalance.save({ validateBeforeSave: false }, { session });
    } else if (refBalance.length) {
      balance.dailyWonBonus += refBalance.dailyWonBonus;
      balance.TotalWonBonus += refBalance.TotalWonBonus;
    }

    if (OrgBalance.userID != balance.userID && OrgBalance.length) {
      await refBalance.save({ validateBeforeSave: false }, { session });
    } else if (OrgBalance.length) {
      balance.dailyWonBonus += OrgBalance.dailyWonBonus;
      balance.TotalWonBonus += OrgBalance.TotalWonBonus;
    }

    if (balance.userID) {
      await balance.save({ validateBeforeSave: false }, { session });
    }

    // Commit the transaction
    await session.commitTransaction();
    console.log("Transaction committed successfully");
    ret = "success";
  } catch (error) {
    console.error("Transaction failed: ", error);
    await session.abortTransaction();
    ret = "failed";
  } finally {
    await session.endSession();
  }

  return ret;
};

export const postCoinMining = asyncErrorHandler(async (req, res, next) => {
  console.log("BEFORE STAGING");
  await stageShares(req.user._id, ORGUSERiD, req.user.referredUID);
  console.log("AFTER STAGING");

  // return res.status(201).json({
  //   status: "success",
  // });
  // Sanitize request body to prevent HTML injection
  req.body = HTMLspecialChars.encode(req.body);

  // Start a MongoDB session and transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Process files if they exist in the request
    if (req.files) {
      const filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
      req.body.files = filesArrayOfObjects;
    }

    // Query to check if the user has watched the video in the last 24 hours
    const coinsMiningViewed = await CoinsMining.findOne({
      userID: req.user._id,
      VideoId: req.body.videoId,
      nextViewTime: { $gt: Date.now() }, // Check within last 24 hours
    });

    // If a record is found, return an error
    if (coinsMiningViewed) {
      const message =
        "Sorry, you have already completed this task within the last 24 hours.";

      console.log(message);

      return res.status(201).json({
        status: "error", // Change to "error" to clarify it's a failed request
        alreadydone: message,
      });
    }

    // Fetch external video data
    const e_VideoServiceURL = `http://${E_VideoHOST}/api/s/v1.00/evideo/evuplv/${req.body.videoId}`;
    const headers = {
      Authorization: `Server ${req.headers.authorization.split(" ")[1]}`,
      serverpassword: serverPassword,
    };

    const { data: e_Video } = await axios.get(e_VideoServiceURL, {
      headers,
    });

    console.log("GOTR HRRRb e_Video ", e_Video);

    if (!e_Video) {
      throw new CustomError("Video data not found", 404);
    }
    console.log("e_Video.watchcode", e_Video.data.watchcode);

    let PrizeCoins = 20;
    let newCoins = 0;
    let videoWatchcodeArray = e_Video.data.watchcode.split(" ");

    if (req.body.watchcode) {
      let userWatchcodeArray = req.body.watchcode.trim().split(/\s+/); // Handles multiple spaces
      let count = 0;

      for (let value of videoWatchcodeArray) {
        let bonus = 0; // for the first 30 sec
        if (userWatchcodeArray.includes(value)) {
          if (value.length >= 6) {
            bonus = 10;
          }
          newCoins += PrizeCoins + bonus;
          count++;
        }
      }

      if (count === videoWatchcodeArray.length) {
        newCoins += 10; // bonus for getting all majic numbers
      }
    } else {
      console.log("Got here");
      let userWatchcodeArray = [
        "watchcode1",
        "watchcode2",
        "watchcode3",
        "watchcode4",
      ].map((code) => req.body[code]?.trim() || "");

      req.body.watchcode = userWatchcodeArray.join(" ");

      console.log("userWatchcodeArray", userWatchcodeArray);

      let count = 0;

      let bonus = 0; // for the first 30 sec
      console.log("userWatchcodeArray[1]", userWatchcodeArray[1]);
      console.log("videoWatchcodeArray[1]", videoWatchcodeArray[1]);
      if (userWatchcodeArray[1] == videoWatchcodeArray[1]) {
        newCoins += PrizeCoins;
        count++;
      }
      if (userWatchcodeArray[2] == videoWatchcodeArray[2]) {
        newCoins += PrizeCoins;
        count++;
      }
      if (userWatchcodeArray[3] == videoWatchcodeArray[3]) {
        newCoins += PrizeCoins;
        count++;
      }

      if (userWatchcodeArray[2] == videoWatchcodeArray[2]) {
        newCoins += PrizeCoins;
        count++;
      }

      if (count == 4) {
        newCoins += 20; // bonus for getting all majic numbers
      }
    }

    console.log("newCoins", newCoins);
    req.body.coins = newCoins;
    let NewCoinsMining = {
      userID: req.user._id,
      activity: "E-Video",
      coins: newCoins,
      VideoId: req.body.videoId,
      Watchcode: req.body.watchcode,
      nextViewTime: e_Video.data.nextViewTime,
      month: numberedMonth,
      day: numberedDay,
    };

    // Encrypt the data and store it in the encData field
    NewCoinsMining.encData = encryptData({ ...NewCoinsMining });
    // console.log("e_Video", e_Video);
    // console.log("NewCoinsMining:", NewCoinsMining);
    // console.log("Request Body:", req.body);
    // console.log("Video ID:", req.body.videoId);
    // console.log("Watch Code:", req.body.watchcode);
    // console.log("User:", req.user);
    // console.log("E-Video Data:", e_Video?.data);

    // Create a new coinsMining record in a MongoDB transaction
    console.log("Yahooo");
    const coinsMining = await CoinsMining.create([NewCoinsMining], { session });
    
    console.log("Yahooo2");
    // Fetch or create user balance
    let balance = await Balance.findOne({ userID: req.user._id }).session(
      session
    );
    console.log("Yahooo3");

    if (!balance) {
      balance = await Balance.create({
        userID: req.user._id,
        TotalMainCoins: 0,
        TotalBonusCoins: 0,
        TotalCurrentCoins: 0,
        TotalCoinsTobeValued: 0,
        TotalMoneyLeft: 0,
        month: numberedMonth,
        dailyMainCoins: 0,
        dailyBonusCoins: 0,
        dailyCurrentCoins: 0,
        dailyTaskCompleted: 0,
        encData: "new",
      });
    }

    console.log("Yahooo4");

    // Fetch or create user balance
    let refBalance = {};
    if (req.user.referredUID == req.user._id) {
      refBalance = balance;
    } else {
      refBalance = await Balance.findOne({
        userID: req.user.referredUID,
      }).session(session);
    }

    if (!refBalance) {
      refBalance = await Balance.create({
        userID: req.user.referredUID,
        TotalMainCoins: 0,
        TotalBonusCoins: 0,
        TotalCurrentCoins: 0,
        TotalCoinsTobeValued: 0,
        TotalMoneyLeft: 0,
        TotalTaskCompleted: 0,
        month: numberedMonth,
        dailyMainCoins: 0,
        dailyBonusCoins: 0,
        dailyCurrentCoins: 0,
        dailyTaskCompleted: 0,
        encData: "new",
      });
    }
    refBalance = await decodeAndVerifyData(refBalance);

    console.log("RESPONS OK2");

    // Referral Bonus
    let bonusData = {
      userId: req.user._id,
      referral: req.user.referredByRef,
      miningID: coinsMining[0]._id,
      miningResource: "e_video",
      bonus: newCoins * 0.1, // 10 percent
      month: numberedMonth,
    };

    let NewBonus = {
      ...bonusData,
    };

    console.log("RESPONS OK3");

    // Statement data
    let statementData = {
      userID: req.user._id,
      transaction: "mining",
      oldBalance: balance.TotalMoneyLeft,
      amount: 0,
      newBalance: balance.TotalMoneyLeft,
      oldTBV_Coins: balance.TotalCoinsTobeValued,
      totalValuedCoins: 0,
      valuedSum: 0,
      valuedAt: 0,
      newTBV_Coins: balance.TotalCoinsTobeValued,
      oldCoins: balance.TotalCurrentCoins,
      minedCoins: newCoins,
      newCoins: balance.TotalCurrentCoins + newCoins,
      // yestTargetLoss: lastTargetLoss,
      // yestTargetTaskCompleted: lastTargetTaskCompleted,
      month: numberedMonth,
    };
    console.log("RESPONS OK4");

    let statement = {
      ...statementData,
    };

    // Update RefBalance
    if (numberedDay !== refBalance.Day) {
      refBalance.dailyMainCoins = 0;
      refBalance.dailyBonusCoins = 0;
      refBalance.dailyCurrentCoins = 0;
      refBalance.dailyTaskCompleted = 0;
    }
    refBalance.userID = req.user.referredUID;
    refBalance.TotalMainCoins = refBalance.TotalMainCoins;
    refBalance.TotalBonusCoins = refBalance.TotalBonusCoins + NewBonus.bonus;
    refBalance.TotalCurrentCoins =
      refBalance.TotalMainCoins + refBalance.TotalBonusCoins;
    refBalance.TotalCoinsTobeValued = refBalance.TotalCoinsTobeValued;
    refBalance.TotalMoneyLeft = refBalance.TotalMoneyLeft;
    refBalance.month = numberedMonth;
    refBalance.Day = numberedDay;
    refBalance.dailyMainCoins = refBalance.dailyMainCoins;
    refBalance.dailyBonusCoins = refBalance.dailyBonusCoins + NewBonus.bonus;
    refBalance.dailyCurrentCoins =
      refBalance.dailyMainCoins + refBalance.dailyBonusCoins;
    refBalance.dailyTaskCompleted = refBalance.dailyTaskCompleted;

    // Update USER Balance
    if (numberedDay !== balance.Day) {
      balance.dailyMainCoins = 0;
      balance.dailyBonusCoins = 0;
      balance.dailyCurrentCoins = 0;
      balance.dailyTaskCompleted = 0;
    }
    balance.userID = req.user._id;
    balance.TotalMainCoins = statement.newCoins;
    balance.TotalBonusCoins = balance.TotalBonusCoins + NewBonus.bonus;
    balance.TotalCurrentCoins =
      balance.TotalMainCoins + balance.TotalBonusCoins;
    balance.TotalCoinsTobeValued = statement.newTBV_Coins;
    balance.TotalMoneyLeft = statement.newBalance;
    balance.TotalTaskCompleted = balance.TotalTaskCompleted + 1;
    balance.month = numberedMonth;
    balance.Day = numberedDay;
    balance.dailyMainCoins = balance.dailyMainCoins + newCoins;
    balance.dailyBonusCoins = balance.dailyBonusCoins + NewBonus.bonus;
    balance.dailyCurrentCoins =
      balance.dailyMainCoins + balance.dailyBonusCoins;

    balance.dailyTaskCompleted = balance.dailyTaskCompleted + 1;

    // Create CoinStatement and ReferralBonuses records
    const newCoinStatement = await CoinStatement.create([statement], {
      session,
    });

    const newBonusRecord = await ReferralBonuses.create([NewBonus], {
      session,
    });

    if (refBalance.userID != balance.userID && refBalance.length) {
      await refBalance.save({ validateBeforeSave: false }, { session });
    }
    // Save balance

    if (balance.userID) {
      await balance.save({ validateBeforeSave: false }, { session });
    }

    // Commit the transaction
    await session.commitTransaction();
    const balanceClone = balance.toObject ? balance.toObject() : { ...balance };
    balanceClone.newCoins = newCoins;

    // balanceClone = await limitEncDetaFromServe(balanceClone);

    console.log("GOT HERE");
    // Send a success response
    return res.status(201).json({
      status: "success",
      resource: "coinsMining",
      action: "created",
      data: balanceClone,
    });
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();

    // Pass the error to the global error handler
    return next(new CustomError(error.message, error.statusCode || 500));
  } finally {
    session.endSession(); // End the session
  }
});

export const getCoinMining = asyncErrorHandler(async (req, res, next) => {
  const coinsMining = await CoinsMining.findById(req.params._id);
  if (!coinsMining) {
    return next(
      new CustomError(`CoinsMining with ID: ${req.params._id} not found`, 404)
    );
  }
  coinsMining = await decodeAndVerifyData(coinsMining);
  coinsMining = await limitEncDetaFromServe(coinsMining);
  res.status(200).json({
    status: "success",
    resource: "coinsMining",
    action: "getOne",
    data: coinsMining,
  });
});
