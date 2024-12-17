// import User from "../Models/userModel.js";
import CustomError from "../Utils/CustomError.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import axios from "axios";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import GetUserDetailsFromHeader from "../Utils/GetUserDetailsFromHeader.js";
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";

import getNextServerIndex from "../Utils/LoadBalancerManual.js";

dotenv.config({ path: "./config.env" });
let HOST = "";

// Set the appropriate HOST based on environment
console.log("process.env.NODE_ENV", process.env.NODE_ENV);

if (process.env.NODE_ENV === "development") {
  HOST = process.env.DEV_HOST;
  console.log("process.env.DEV_AUTH_HOST", process.env.DEV_AUTH_HOST);
} else {
  HOST = process.env.PROD_HOST;
}


const AuthHOST = () => {
  let url;

  if (process.env.NODE_ENV === "development") {
    url = `http://${process.env.DEV_AUTH_HOST}`;
  } else if (
    process.env.NODE_ENV === "production" &&
    process.env.PROD_TEST === "true"
  ) {
    url = `http://${process.env.AUTH_HOST}`;
  } else {
    url = `http://${process.env.AUTH_HOST}`;

    // Split and modify the URL
    const [firstPart, secondPart] = url.split(/\.(.+)/);

    // Assuming `getNextServerIndex` is a function that returns a string or number
    url = `${firstPart}${getNextServerIndex("AUTH_HOST")}.${secondPart}`;
  }

  return url;
};

// // Example usage
// console.log(AuthHOST());


/**
 * Middleware to protect routes and ensure that the user is authenticated.
 */
// import User from "../Models/userModel.js";

const serverPassword = process.env.SERVER_PASSWORD; // Securely load the server password from environment variables

/**
 * Middleware to protect routes and ensure that the user is authenticated.
 */
export const protect = asyncErrorHandler(async (req, res, next) => {
  // 1. Read the token from the request header
  const token = req.headers.authorization;

  if (!token) {
    return next(new CustomError("You are not logged in!", 401));
  }

  // 2. Decode the token and extract user details
  const decodedToken = await GetUserDetailsFromHeader(token);

  // 3. Verify token type and handle user-agent for Bearer tokens
  const tokenType = req.headers.authorization.split(" ")[0];

  if (tokenType === "Bearer") {
    const currentUserAgent = req.headers["user-agent"];

    if (!currentUserAgent) {
      return next(new CustomError("User-Agent header is missing", 400));
    }

    const isSameUserAgent = await bcrypt.compare(
      currentUserAgent,
      decodedToken.wizard
    );
    if (!isSameUserAgent) {
      return next(new CustomError("Device mismatch. Please login again", 417));
    }

    // const isProduction = process.env.NODE_ENV === "production";
    // if (
    //   isProduction &&
    //   decodedToken.addysmartClientUserLoginId !==
    //     req.cookie.addysmartClientUserLoginId
    // ) {
    //   return next(
    //     new CustomError("Device secrete mismatch. Please login again", 417)
    //   );
    // }
  } else if (
    tokenType === "Server" &&
    req.headers.serverpassword === serverPassword
  ) {
    // Server-to-server authentication is allowed
  } else {
    return next(
      new CustomError(
        "Invalid token or device mismatch. Please login again",
        417
      )
    );
  }

  // 4. Fetch user details from microservice
  // AuthHOST;
  const userServiceURL = `${AuthHOST()}/api/s/v1.00/users/me`;
  const headers = {
    Authorization: `Server ${token.split(" ")[1]}`,
    serverpassword: serverPassword,
  };

  try {
    const { data: userData } = await axios.get(userServiceURL, { headers });
    const user = await decodeAndVerifyData(userData.data);
    console.log("auth User", user);
    if (!user) {
      return next(
        new CustomError("The user with the given token does not exist", 401)
      );
    }
    // 5. Check if the user has changed their password after the token was issued
    if (new Date(user.passwordChangedAt).getTime() > decodedToken.iat * 1000) {
      return next(
        new CustomError(
          "Password has been changed recently. Please log in again.",
          401
        )
      );
    }

    // 6. Check if the user has been logged out
    if (new Date(user.loggedOutAllAt).getTime() > decodedToken.iat * 1000) {
      return next(
        new CustomError(
          "This account has been logged out. Please log in again",
          401
        )
      );
    }

    // 7. Check if the user's role has changed
    if (new Date(user.roleChangedAt).getTime() > decodedToken.iat * 1000) {
      return next(
        new CustomError(
          "User role has changed recently. Please login again",
          401
        )
      );
    }

    // 8. Assign the user to the request object
    req.user = user;
    console.log("req.Myuser", req.user);
    next();
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return next(new CustomError("User not found in the user service", 404));
    }
    return next(new CustomError("Error fetching user details", 500));
  }
});

/**
 * Middleware to authenticate server-to-server connections.
 * It verifies that the correct server password is provided in the request headers.
 */

const MAX_BLACKLISTED_IPS = 10;
const BLOCK_DURATION = 20 * 60 * 1000; // 20 minutes
const WHITELIST_DURATION = 1 * 60 * 60 * 1000; // 1 hour

const blacklistedIPs = {}; // Stores blacklisted IPs and their expiration times
const whitelistedIPs = {}; // Stores whitelisted IPs and their expiration times

export const s2sProtect = asyncErrorHandler(async (req, res, next) => {
  const providedServerPassword = req.headers.serverpassword;
  const clientIP = req.ip;
  const now = Date.now();

  // Check if the IP is whitelisted
  if (whitelistedIPs[clientIP] && now < whitelistedIPs[clientIP]) {
    return next(); // IP is whitelisted, allow access
  }

  // Check if the IP is blacklisted
  if (blacklistedIPs[clientIP] && now < blacklistedIPs[clientIP]) {
    return next(
      new CustomError("Too many failed attempts. Try again later.", 429)
    );
  }

  // If more than the threshold number of IPs are blacklisted in the past 10 minutes,
  // only allow access to whitelisted IPs
  const blacklistedCount = Object.values(blacklistedIPs).filter(
    (expirationTime) => now < expirationTime
  ).length;

  if (blacklistedCount >= MAX_BLACKLISTED_IPS) {
    if (!whitelistedIPs[clientIP]) {
      return next(
        new CustomError(
          "Access restricted to whitelisted IPs only. Please contact support.",
          403
        )
      );
    }
  }

  // Check if the server password is provided
  if (!providedServerPassword) {
    addToBlacklist(clientIP, now);
    return next(new CustomError("Server password is required", 401));
  }

  // Verify the server password
  if (providedServerPassword !== process.env.SERVER_PASSWORD) {
    addToBlacklist(clientIP, now);
    return next(new CustomError("Invalid server password", 403));
  }

  // Reset blacklist and whitelist entries
  resetBlacklist(clientIP);
  addToWhitelist(clientIP, now);

  next();
});

function addToBlacklist(ip, now) {
  blacklistedIPs[ip] = now + BLOCK_DURATION;
  cleanExpiredEntries(blacklistedIPs);
}

function addToWhitelist(ip, now) {
  whitelistedIPs[ip] = now + WHITELIST_DURATION;
  cleanExpiredEntries(whitelistedIPs);
}

function resetBlacklist(ip) {
  delete blacklistedIPs[ip];
}

function cleanExpiredEntries(storage) {
  const now = Date.now();
  for (const ip in storage) {
    if (storage[ip] < now) {
      delete storage[ip];
    }
  }
}

/**
 * Middleware to restrict access based on user roles.
 * @param {...string} roles - Allowed roles for the route.
 */
export const restrict = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(
        new CustomError(
          "You do not have permission to perform this action",
          403
        )
      );
    }

    // Check if user has any of the required roles
    const hasPermission = req.user.role.some((userRole) =>
      roles.includes(userRole)
    );

    if (!hasPermission) {
      return next(
        new CustomError(
          "You do not have permission to perform this action",
          403
        )
      );
    }

    next();
  };
};
