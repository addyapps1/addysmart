// Importing necessary modules for the campaign performance functionality
import OrganicFollowers from "../Models/Campaign.js";
import CampainPerformanceData from "../Models/CampaignPerformanceData.js";
import ApiFeatures from "../Utils/ApiFeatures.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import CustomError from "../Utils/CustomError.js";
import paginationCrossCheck from "../Utils/paginationCrossCheck.js";
import UnlinkMultipleFiles from "../Utils/UnlinkMultipleFiles.js";
import ProcessMultipleFilesArrayOfObjects from "../Utils/ProcessMultipleFilesArrayOfObjects.js";
import HTMLspecialChars from "../Utils/HTMLspecialChars.js";
import GetUserDetailsFromHeader from "../Utils/GetUserDetailsFromHeader.js";
import updateResponseFilePathsWithHostName from "../Utils/updateResponseFilePathsWithHostName.js";
import mongoose from "mongoose";
import retryACIDTransaction from "../Utils/RetryACIDTransaction.js"; // Import the retry utility
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";



/**
 * Track today's performance
 */
export const trackTodaysPerformance = asyncErrorHandler(
  async (req, res, next) => {
    const user = GetUserDetailsFromHeader(req);

    // Function to track today's performance with retry
    const trackPerformanceWithRetry = async (session) => {
      try {
        // Fetch or create today's record
        let todayPerformance = await CampainPerformanceData.findOne({
          user: user._id,
          createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
        }).session(session);

        if (!todayPerformance) {
          todayPerformance = await CampainPerformanceData.create([
            {
              user: user._id,
              followers: 0,
              subscribers: 0,
              views: 0,
            },
          ]);
        }

        // Example logic for updating performance (add your actual update logic here)
        todayPerformance.followers += 10; // Update this based on your actual logic
        todayPerformance.subscribers += 5; // Update this based on your actual logic
        todayPerformance.views += 20; // Update this based on your actual logic

        await todayPerformance.save({ session });
        return todayPerformance;
      } catch (error) {
        throw new CustomError(
          `Failed to track today's performance: ${error.message}`,
          500
        );
      }
    };

    // Create a session and use retry mechanism with the tracking function
    const performanceData = await retryACIDTransaction(
      trackPerformanceWithRetry,
      user._id
    );

    res.status(200).json({
      success: true,
      data: performanceData,
    });
  }
);

/**
 * Track everyday performance on followers data
 */
export const trackEveryDaysPerformanceOnFollowersData = asyncErrorHandler(
  async (req, res, next) => {
    const user = GetUserDetailsFromHeader(req);

    // Function to track followers' performance data with retry
    const trackFollowersPerformanceWithRetry = async (session) => {
      try {
        const followersData = await OrganicFollowers.findOne({
          user: user._id,
        }).session(session);

        if (!followersData) {
          throw new CustomError("No follower data found for the user", 404);
        }

        // Example logic for updating followers' performance (add your actual update logic here)
        followersData.followersCount += 5; // Update this based on your actual logic
        followersData.subscriberCount += 3; // Update this based on your actual logic

        await followersData.save({ session });
        return followersData;
      } catch (error) {
        throw new CustomError(
          `Failed to track followers' data: ${error.message}`,
          500
        );
      }
    };

    // Create a session and use retry mechanism with the tracking function
    const followersPerformance = await retryACIDTransaction(
      trackFollowersPerformanceWithRetry,
      user._id
    );

    res.status(200).json({
      success: true,
      data: followersPerformance,
    });
  }
);

// POST: Log followers gained
export const postFollowersGained = asyncErrorHandler(async (req, res, next) => {
  const { campaignId } = req.body;

  const performanceDoc = await CampainPerformanceData.findById(campaignId);
  if (!performanceDoc) {
    return next(
      new CustomError(`Performance data with ID: ${campaignId} not found`, 404)
    );
  }

  // Wrap logic inside a retryACIDTransaction call
  const followersGainedData = await retryACIDTransaction(async (session) => {
    const todayPerformance = await trackTodaysPerformance(
      performanceDoc,
      1,
      0,
      0,
      session
    );
    const followersData = await trackEveryDaysPerformanceOnFollowersData(
      campaignId,
      1,
      0,
      0,
      session
    );

    return { todayPerformance, followersData };
  }, performanceDoc.user); // Assuming performanceDoc has user reference

  res
    .status(200)
    .json({
      status: "success",
      message: "Followers gained logged",
      data: followersGainedData,
    });
});




const getDistance = (userLocation, targetLocation) => {
  const [lon1, lat1] = userLocation;
  const [lon2, lat2] = targetLocation;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const R = 6371; // Earth radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

// Function to determine which users to send a campaign task to based on their profile and performance
export const getTargetedCampaignTask = asyncErrorHandler(async (req, res, next) => {
  // Validate user data
  let user = req.user;
  let userLocationCoordinate = req.headers.userLocationCoordinate;
  
  if (!user || !user.dateOfBirth || !user.gender || !user.location) {
    return res.status(400).json({ error: "Invalid user data." });
  }

  const today = new Date();
  const userAge = calculateAge(user.dateOfBirth);
  const userGender = user.gender;
  const userLocation = userLocationCoordinate;
  const userInterests = user.interests || [];
  const userBehaviors = user.behaviors || [];

// Function to get the distance between two geographical points
function getDistance(userLocation, targetLocation) {
  const [lon1, lat1] = userLocation;
  const [lon2, lat2] = targetLocation;

  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const R = 6371e3; // Earth's radius in meters
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
}

// Function to determine if a point is within a polygon
function isPointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

// Updated function to get targeted campaign task
export const getTargetedCampaignTask = asyncErrorHandler(async (req, res, next) => {
  let user = req.user;
  let userLocationCoordinate = req.headers.userLocationCoordinate;

  // Validate user location coordinate
  try {
    validateUserLocationCoordinate(userLocationCoordinate);
  } catch (error) {
    return next(error); // Handle validation error
  }

  if (!user || !user.dateOfBirth || !user.gender || !user.location) {
    return res.status(400).json({ error: "Invalid user data." });
  }

  const today = new Date();
  const userAge = calculateAge(user.dateOfBirth);
  const userGender = user.gender;
  const userLocation = userLocationCoordinate;
  const userInterests = user.interests || [];
  const userBehaviors = user.behaviors || [];

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Query the OrganicFollowers collection to find campaigns targeting users like this one
    const targetedCampaigns = await OrganicFollowers.aggregate([
      {
        $match: {
          startDate: { $lte: today },
          endDate: { $gte: today },
          "todaysPerformance.taskRequestsSent": {
            $lt: { $subtract: ["$dailyTasksLimit", 10] },
          },
          $or: [
            { "targetAudience.demographics.minAge": { $lte: userAge } },
            { "targetAudience.demographics.maxAge": { $gte: userAge } },
          ],
          $or: [
            { "targetAudience.demographics.gender": "All" },
            { "targetAudience.demographics.gender": userGender },
          ],
          $or: [
            { "targetAudience.interests": { $in: userInterests } },
            { "targetAudience.behaviors": { $in: userBehaviors } },
          ],
        },
      },
      {
        $addFields: {
          distanceFromUser: {
            $cond: [
              { $eq: ["$targetAudience.geography.type", "Point"] },
              {
                $let: {
                  vars: {
                    targetLocation: "$targetAudience.geography.coordinates",
                  },
                  in: getDistance(userLocation, "$$targetLocation"),
                },
              },
              -1,
            ],
          },
        },
      },
      {
        $match: {
          $or: [
            {
              "targetAudience.geography.type": "Polygon",
              $expr: {
                $function: {
                  body: isPointInPolygon,
                  args: [userLocation, "$targetAudience.geography.coordinates"],
                  lang: "js",
                },
              },
            },
            {
              "targetAudience.geography.type": "Point",
              distanceFromUser: { $lte: "$targetAudience.geography.radius" },
            },
          ],
        },
      },
      {
        $sample: { size: 1 }, // Randomly select one user
      },
      {
        $project: {
          title: 1,
          description: 1,
          taskDetails: 1,
          impressions: "$todaysPerformance.taskRequestsSent",
          dailyTasksLimit: 1,
          completionRequiredBy: 1,
          callToAction: 1,
        },
      },
    ]);

    await session.commitTransaction();

    // Return the targeted campaign task, or null if none found
    return res.status(200).json(targetedCampaigns.length > 0 ? targetedCampaigns[0] : null);
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});


// Function to get targeted campaigns based on user location and radius
export const getTargetedCampaigns = async (userLocation, radius) => {
  validateUserLocationCoordinate(userLocation);

  const campaigns = await CampainPerformanceData.find({
    location: {
      $geoWithin: {
        $centerSphere: [userLocation, radius / 6378.1], // radius in radians
      },
    },
  });

  return campaigns;
};

// Get all ads
export const getOrganicFollowerss = asyncErrorHandler(
  async (req, res, next) => {
    let features = new ApiFeatures(OrganicFollowers.find(), req.query)
      .filter()
      .pagination();

    const organicFollowers = await features.query;

    // Include the additional features you need
    const updatedResponse = await updateResponseFilePathsWithHostName(
      organicFollowers
    );

    res.status(200).json({
      success: true,
      count: updatedResponse.length,
      data: updatedResponse,
    });
  }
);

// Handle other potential endpoints and utilities as needed...

/**
 * Track today's performance
 */
export const trackTodaysPerformance = asyncErrorHandler(
  async (req, res, next) => {
    const user = GetUserDetailsFromHeader(req);

    // Function to track today's performance with retry
    const trackPerformanceWithRetry = async () => {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        // Fetch or create today's record
        let todayPerformance = await CampainPerformanceData.findOne({
          user: user._id,
          createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
        });

        if (!todayPerformance) {
          todayPerformance = await CampainPerformanceData.create({
            user: user._id,
            followers: 0,
            subscribers: 0,
            views: 0,
          });
        }

        // Example logic for updating performance (add your actual update logic here)
        todayPerformance.followers += 10; // Update this based on your actual logic
        todayPerformance.subscribers += 5; // Update this based on your actual logic
        todayPerformance.views += 20; // Update this based on your actual logic

        await todayPerformance.save({ session });
        await session.commitTransaction();
        session.endSession();

        return todayPerformance;
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new CustomError(
          `Failed to track today's performance: ${error.message}`,
          500
        );
      }
    };

    // Use retry mechanism with the tracking function
    const performanceData = await retry(
      trackPerformanceWithRetry,
      5,
      2000,
      "Failed to track performance after multiple retries"
    );
    res.status(200).json({
      success: true,
      data: performanceData,
    });
  }
);



// POST: Log followers gained
export const postFollowersGained = asyncErrorHandler(async (req, res, next) => {
  const { campaignId } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const performanceDoc = await CampainPerformanceData.findById(
      campaignId
    ).session(session);
    if (!performanceDoc) {
      await session.abortTransaction();
      return next(
        new CustomError(
          `Performance data with ID: ${campaignId} not found`,
          404
        )
      );
    }

    await trackTodaysPerformance(performanceDoc, 1, 0, 0, session);
    await trackEveryDaysPerformanceOnFollowersData(campaignId, 1, 0, 0);

    await session.commitTransaction();
    res
      .status(200)
      .json({ status: "success", message: "Followers gained logged" });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

// POST: Log subscribers gained
export const postSubscribersGained = asyncErrorHandler(
  async (req, res, next) => {
    const { campaignId } = req.body;
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const performanceDoc = await CampainPerformanceData.findById(
        campaignId
      ).session(session);
      if (!performanceDoc) {
        await session.abortTransaction();
        return next(
          new CustomError(
            `Performance data with ID: ${campaignId} not found`,
            404
          )
        );
      }

      await trackTodaysPerformance(performanceDoc, 0, 1, 0, session);
      await trackEveryDaysPerformanceOnFollowersData(campaignId, 0, 1, 0);

      await session.commitTransaction();
      res
        .status(200)
        .json({ status: "success", message: "Subscribers gained logged" });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  }
);

// POST: Log total views
export const postTotalViews = asyncErrorHandler(async (req, res, next) => {
  const { campaignId } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const performanceDoc = await CampainPerformanceData.findById(
      campaignId
    ).session(session);
    if (!performanceDoc) {
      await session.abortTransaction();
      return next(
        new CustomError(
          `Performance data with ID: ${campaignId} not found`,
          404
        )
      );
    }

    await trackTodaysPerformance(performanceDoc, 0, 0, 1, session);
    await trackEveryDaysPerformanceOnFollowersData(campaignId, 0, 0, 1);

    await session.commitTransaction();
    res.status(200).json({ status: "success", message: "Total views logged" });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

// Utility functions for location and campaign task targeting

const validateUserLocationCoordinate = (coordinate) => {
  if (!Array.isArray(coordinate) || coordinate.length !== 2) {
    throw new CustomError(
      "Invalid location coordinate format. Expected an array of [longitude, latitude].",
      400
    );
  }
  const [lon, lat] = coordinate;
  if (typeof lon !== "number" || typeof lat !== "number") {
    throw new CustomError(
      "Invalid coordinates. Longitude and latitude must be numbers.",
      400
    );
  }
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
    throw new CustomError(
      "Coordinates out of range. Longitude must be between -180 and 180, latitude between -90 and 90.",
      400
    );
  }
};

const getDistance = (userLocation, targetLocation) => {
  const [lon1, lat1] = userLocation;
  const [lon2, lat2] = targetLocation;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const R = 6371; // Earth radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

// Function to get targeted campaigns based on user location and radius
export const getTargetedCampaigns = async (userLocation, radius) => {
  validateUserLocationCoordinate(userLocation);

  const campaigns = await CampainPerformanceData.find({
    location: {
      $geoWithin: {
        $centerSphere: [userLocation, radius / 6378.1], // radius in radians
      },
    },
  });

  return campaigns;
};

// Get all ad
export const getOrganicFollowerss = asyncErrorHandler(
  async (req, res, next) => {
    let features = new ApiFeatures(OrganicFollowers.find(), req.query)
      .countDocuments()
      .filter()
      .sort()
      .limitfields()
      .limitfields2()
      .paginate();

    // Execute the query and get the result
    let OrganicFollowerss = await features.query;

    // Get the total count of records
    let totalCount = await features.totalCountPromise;

    console.log("RecordsEstimate", totalCount);

    OrganicFollowerss = updateResponseFilePathsWithHostName(
      OrganicFollowerss,
      process.env.HOST
    );

    res.status(200).json({
      status: "success",
      resource: "OrganicFollowerss",
      RecordsEstimate: totalCount,
      action: "getAll",
      length: OrganicFollowerss.length,
      data: OrganicFollowerss,
    });
  }
);

// Create a new ad video
export const postOrganicFollowers = asyncErrorHandler(
  async (req, res, next) => {
    req.body = HTMLspecialChars(req.body);
    if (req.files) {
      let filesArrayOfObjects = ProcessMultipleFilesArrayOfObjects(req);
      req.body.files = filesArrayOfObjects;
    }

    const OrganicFollowers = await OrganicFollowers.create(req.body);

    // Initialize performance data
    const adPerformanceData = await AdPerformanceData.create({
      adId: OrganicFollowers._id,
      data: [],
    });

    res.status(201).json({
      status: "success",
      resource: "OrganicFollowerss",
      OrganicFollowers: "created",
      length: OrganicFollowers.length,
      data: OrganicFollowers,
      performanceData: adPerformanceData,
    });
  }
);
