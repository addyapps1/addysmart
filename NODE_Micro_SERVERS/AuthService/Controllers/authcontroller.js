import User from "../Models/userModel.js";
import manageReferralTask, {
  checkVIPStatus,
} from "./referralTaskController.js";
import CustomError from "../Utils/CustomError.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; // used in registration function
import util from "util"; // used in a function
import sendEmail from "../Utils/email.js";
import limitUserDetailsServeFields from "../Utils/limitUserDetailsServeFields.js";
import paginationCrossCheck from "../Utils/paginationCrossCheck.js";
import crypto from "crypto";
import ApiFeatures from "../Utils/ApiFeatures.js";
import GetUserDetailsFromHeader from "../Utils/GetUserDetailsFromHeader.js";
import SetUploadsfilePathHandler from "../Utils/SetUploadsfilePathHandler.js";
import HTMLspecialChars from "../Utils/HTMLspecialChars.js";
import UnlinkSingleFile from "../Utils/UnlinkSingleFile.js";
import updateResponseFilePathsWithHostName from "../Utils/updateResponseFilePathsWithHostName.js";
// adVideo = updateResponseFilePathsWithHostName(adVideo, HOST);

import getNextServerIndex from "../Utils/LoadBalancerManual.js"

import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import decodeAndVerifyData from "../Utils_Enc/decodeAndVerifyData.js";
import limitEncDetaFromServe from "../Utils_Enc/limitEncDetaFromServe.js";

import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

let HOST;
let Client_HOST;
if (process.env.NODE_ENV === "development") {
  HOST = process.env.DEV_HOST;
  Client_HOST = process.env.DEV_CLIENT_HOST;
} else {
  HOST = process.env.PROD_HOST;
  Client_HOST = process.env.CLIENT_HOST;
}

const signToken = (_id, email, role, useragent, addysmartClientUserLoginId) => {
  const payload = {
    _id: _id,
    email: email,
    role: role,
    wizard: useragent,
    addysmartClientUserLoginId: addysmartClientUserLoginId,
  };
  const exp = { expiresIn: process.env.LOGIN_EXP };
  const secretkey = process.env.SECRETKEY;
  return jwt.sign(payload, secretkey, exp);
};

const sendVerificationEmail = async (newUser, VerificationToken, req) => {
  // Construct the verification URL
  const verifyUrl = `${req.protocol}://${Client_HOST}?verify=${VerificationToken}`;

  // Construct the HTML message
  const message = ` 
    <html>
      <body>
        <p>Hi <b>${newUser.firstName} ${newUser.middleName || ""} ${
    newUser.lastName
  }</b>,</p> 
        <p>We have received your new account.</p>
        <p>Please use the link below to verify your email:</p>
        <table align='center'>
          <tr>
            <td align='center' style='color:#FFF; cursor:pointer; padding: 10px 18px; border-radius:10px; background-color:#23BE30;'>
              
              <b><a href='${verifyUrl}'>${verifyUrl}</a></b>
            </td>
          </tr>
        </table>
        <p>You can also click on 'verify email' below to verify your email.</p>
        <table align='center'>
          <tr>
            <td align='center' style='color:#FFF; cursor:pointer; padding: 10px 18px; border-radius:10px; background-color:#23BE30;'>
              <a href='${verifyUrl}'><b>VERIFY EMAIL</b></a>
            </td>
          </tr>
        </table>


    WITH ${process.env.ORGNAME.toUpperCase()}, </br>
    MAKING EXTRA INCOME IS ASSURED.

  <p>Thank you for choosing ${process.env.ORGNAME.toUpperCase()}.</p>
        <p><b> ${process.env.ORGNAME.toUpperCase()}, <em>${process.env.ORGSLOGAN.toUpperCase()} </em></b>.</p>
        <p>For information on ${process.env.ORGNAME.toUpperCase()}, visit <a href='${
    req.protocol
  }://${HOST}'>${req.protocol}://${Client_HOST}</a></p>
      </body>
    </html>`;

  let emailVerificationMessage = "";
  let success = false;
  let tries = 0;

  // Function to attempt sending the email
  const sendAnEmail = async () => {
    try {
      console.error(`Email sending ${tries}...`);
      await sendEmail({
        email: newUser.email,
        subject: "Registration Successful",
        message: message,
      });
      emailVerificationMessage = `Email verification mail has been sent to ${newUser.email}, please verify your email address.`;
      success = true;
      console.log(emailVerificationMessage);
    } catch (err) {
      if (tries < 4) {
        // Allow 4 retries
        tries++;
        console.error("Email send failed. Retrying...", err);
        await sendAnEmail(tries); // Recursive call to retry
      } else {
        // Clean up verification tokens if sending fails after multiple attempts
        newUser.emailVerificationToken = undefined;
        newUser.emailVerificationTokenExp = undefined;
        emailVerificationMessage = `Email verification mail failed after multiple attempts.`;
        console.error("Email verification failed: ", err);
      }
    }
  };

  await sendAnEmail(); // Start trying to send the email
  return {
    success,
    message: emailVerificationMessage,
    emailVerificationMessage,
    tries, // Return structured message
  };
};

export const ResendVerificationEmail = asyncErrorHandler(
  async (req, res, next) => {
    // Find the user by ID from the request
    let user = await User.findById(req.user._id);

    // Check if user is found
    if (!user) {
      return next(
        new CustomError(`User with ID: ${req.user._id} not found`, 404)
      );
    }
    user = await decodeAndVerifyData(user);

    // Check if the email is already verified
    if (user.emailVerified) {
      return next(
        new CustomError(
          "Email is already verified. No need to resend the verification email.",
          400
        )
      );
    }

    // Generate a verification token
    const VerificationToken = await user.createEmailVerificationToken();

    // Log the verification token (remove or change to a logging mechanism in production)
    // console.log("Generated Verification Token:", VerificationToken);

    // Send the verification email
    await sendVerificationEmail(user, VerificationToken, req);

    // Save the updated user
    await user.save({ validateBeforeSave: false });

    // Send a success response
    res.status(201).json({
      status: "success",
      message: "Verification email has been resent successfully.",
    });
  }
);

export const VerifyEmail = asyncErrorHandler(async (req, res, next) => {
  try {
    // Extract the token from the URL params
    const verificationTokenFromURL = req.params.token;

    // Parse the token to extract the raw token and email
    function parseVerificationToken(token) {
      const parts = token.split("-");
      if (parts.length < 2) {
        throw new CustomError("Invalid token format", 400);
      }
      const tokenx = parts[0];
      const email = decodeURIComponent(parts.slice(1).join("-"));
      const rawToken = `${tokenx}-${encodeURIComponent(email)}`;
      return { rawToken, email };
    }

    // Extract the raw token and email from the token
    const { rawToken, email } = parseVerificationToken(
      verificationTokenFromURL
    );

    // Hash the raw token to compare with the stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Find the user by the extracted email and hashed token
    let user = await User.findOne({
      email: email,
      emailVerificationToken: hashedToken,
      emailVerificationTokenExp: { $gt: Date.now() }, // Ensure the token has not expired
    }).select("+password");

    if (!user) {
      return next(
        new CustomError("Verification token is invalid or has expired", 400)
      );
    }

    // Mark the user's email as verified and clear verification fields
    user = await decodeAndVerifyData(user);
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExp = undefined;
    user.emailVerified = true;

    // Save the updated user
    await user.save({ validateBeforeSave: false });

    // Respond with the success message and token
    res.status(201).json({
      status: "success",
      resource: "user",
      action: "email-verified",
    });
  } catch (error) {
    // Handle token parsing errors or other potential issues
    return next(error);
  }
});

export const signup = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  if (!req.body.referredByRef) {
    req.body.referredByRef = process.env.ORG_REFERAL_ID;
  }

  // Create a new user using the request body to return updated record
  let newUser = await User.create(req.body);

  //2 GENERATE A RANDOM TOKEN FOR THE USER
  const VerificationToken = await newUser.createEmailVerificationToken();
  // console.log("VerificationToken", VerificationToken);
  // console.log("newUser.emailVerificationToken", newUser.emailVerificationToken);
  // console.log("newUser.emailVerificationTokenExp", newUser.emailVerificationTokenExp);


  // console.log("referredUID", newUser.referredUID);
  if (newUser._id !== newUser.referredUID) {
    console.log("manageReferralTask called");
    const isVIP_data = await manageReferralTask(
      newUser._id,
      newUser.referredUID,
      newUser.referredByRef,
      newUser.superReferredUID
    );

    if (isVIP_data) {
      // update referredByUser VIP status
      const referredByUser = await User.findByIdAndUpdate(
        newUser.referredUID,
        { isVIP: isVIP_data.isVIP },
        {
          new: true,
          runValidators: true,
        }
      );
    }
  }



  const resp = await sendVerificationEmail(newUser, VerificationToken, req);

  // At this point every modification to the user object has been made
  let newUserUpdated = await newUser.save({ validateBeforeSave: false }); // this saves the encrypted token and the expiry date generated in user.createResetPasswordToken(), together with every modification to the user object and {validateBeforeSave: false} prevents validation

  let limitedUser = limitUserDetailsServeFields(newUserUpdated);

  // let userAgent = crypto.createHash('sha256').update(req.headers['user-agent']).digest('hex')
  let userAgent = await bcrypt.hash(req.headers["user-agent"], 11);
  const randomString = crypto.randomBytes(30).toString("hex");
  let addysmartClientUserLoginId = randomString;
  const token = signToken(
    newUser._id,
    newUser.email,
    newUser.role,
    userAgent,
    addysmartClientUserLoginId
  );

  // const isProduction = process.env.NODE_ENV === "production";
  // res.cookie("addysmartClientUserLoginId", addysmartClientUserLoginId, {
  //   httpOnly: isProduction, // The cookie cannot be accessed via JavaScript
  //   secure: isProduction, // Only send over HTTPS in production
  //   domain: isProduction
  //     ? process.env.CLIENT_HOST // Use your production domain
  //     : "localhost", // Use localhost in development
  //   sameSite: isProduction ? "None" : "Lax", // Cross-origin in production
  //   path: "/",
  //   expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toUTCString(), // Expires in 3 days
  // });

  const isProduction = process.env.NODE_ENV === "production";
  const cookieValue =
    `addysmartClientUserLoginId=${addysmartClientUserLoginId}; ` +
    `HttpOnly=${isProduction}; ` + // Should be 'httponly'
    `Secure=${isProduction}; ` + // Should be 'secure'
    `Domain=${isProduction ? process.env.CLIENT_HOST : "localhost"}; ` +
    `Path=/; ` +
    `Expires=${new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toUTCString()}; ` +
    `SameSite=${isProduction ? "None" : "Lax"}`; // Should be 'samesite'

  // Set the cookie
  res.setHeader("Set-Cookie", cookieValue);

  limitedUser = await limitEncDetaFromServe(limitedUser);

  res.status(201).json({
    status: "success",
    token,
    resource: "user",
    user: "created",
    lenght: newUser.length,
    emailverificationMessage: resp.emailVerificationMessage,
    tries: resp.tries,
    data: limitedUser,
  });
});

export const login = asyncErrorHandler(async (req, res, next) => {
  console.log("loging in");
  req.body = HTMLspecialChars.encode(req.body);
  // const { username, password } = req.body
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    const error = new CustomError(
      "Please provide email and password for login",
      400
    );
    return next(error);
  }

  // const user = await User.findOne({email: req.body.username, phone: req.body.username})// for phone or email login system
  // const user = await User.findOne({email: email})
  let user = await User.findOne({ email }).select("+password");
  // const isMatch = await user.comparePasswordInDb(password, user.password)
  // handle brut

  if (!user) {
    const attemptsLeft = Math.floor(Math.random() * 4) + 1; // Generates a random number between 1 and 4
    const error = new CustomError(
      `Incorrect login details, ${attemptsLeft} attempt(s) left`,
      400
    );
    return next(error);
  }

  let pass1 = user.password;
  console.log("pass1", pass1);
  user = await decodeAndVerifyData(user);

  if (user.failedLogginAttempts < 5) {
    if (!user || !(await user.comparePasswordInDb(password, user.password))) {
      user.failedLogginAttempts += 1;
      user.lastAttemptTime = new Date();
      await user.save({ validateBeforeSave: false });
      const error = new CustomError(
        `Incorrect login details, ${
          5 - user.failedLogginAttempts
        } attempt(s) left`,
        400
      );
      return next(error);
    } else {
      user.failedLogginAttempts = 0;
      user.lastAttemptTime = new Date();
      await user.save({ validateBeforeSave: false });
    }
  } else if (new Date() - user.lastAttemptTime > 1800000) {
    // 30 min after last failled attempt
    // cancel prev attempt records
    user.failedLogginAttempts = 0;
    user.lastAttemptTime = new Date();
    await user.save({ validateBeforeSave: false });

    //validate new login attempt
    if (!user || !(await user.comparePasswordInDb(password, user.password))) {
      user.failedLogginAttempts = 1;
      user.lastAttemptTime = new Date();
      await user.save({ validateBeforeSave: false });
      const error = new CustomError("Incorrect login details", 400);
      return next(error);
    } else {
      user.failedLogginAttempts = 0;
      user.lastAttemptTime = new Date();
      await user.save({ validateBeforeSave: false });
    }
  } else {
    const error = new CustomError(
      "Incorrect login details or temprarily blocked",
      400
    );
    return next(error);
  }

  // let userAgent = crypto.createHash('sha256').update(req.headers['user-agent']).digest('hex')
  let userAgent = await bcrypt.hash(req.headers["user-agent"], 11);
  const randomString = crypto.randomBytes(30).toString("hex");
  let addysmartClientUserLoginId = randomString;
  const token = signToken(
    user._id,
    user.email,
    user.role,
    userAgent,
    addysmartClientUserLoginId
  );

  const isProduction = process.env.NODE_ENV === "production";

  // Set the cookie
  res.cookie("addysmartClientUserLoginId", addysmartClientUserLoginId, {
    // httpOnly: isProduction, // The cookie cannot be accessed via JavaScript
    // secure: isProduction, // Only send over HTTPS in production
    domain: isProduction
      ? process.env.CLIENT_HOST // Use your production domain
      : "localhost", // Use localhost in development
    sameSite: isProduction ? "None" : "Lax", // Cross-origin in production
    // path: "/",
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Expires in 3 days
  });

  // Log confirmation after setting the cookie
  console.log("Cookie has been set");

  // res.cookie("addysmartClientUserLoginId", "addysmartClient_UserLoginId", expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))

  //  const isProduction = process.env.NODE_ENV === "production";
  //  const cookieValue =
  //    `addysmartClientUserLoginId=${addysmartClientUserLoginId}; ` +
  //    `HttpOnly=${isProduction}; ` +
  //    `Secure=${isProduction}; ` +
  //    `Domain=${isProduction ? process.env.CLIENT_HOST : "localhost"}; ` +
  //    `Path=/; ` +
  //    `Expires=${new Date(
  //      Date.now() + 3 * 24 * 60 * 60 * 1000
  //    ).toUTCString()}; ` +
  //    `SameSite=${isProduction ? "None" : "Lax"}`;

  //  res.setHeader("Set-Cookie", cookieValue);

  // Set a cookie with an expiration date of 3 days

  let limitedUser;
  limitedUser = await decodeAndVerifyData(user);
  limitedUser = limitUserDetailsServeFields(limitedUser);
  limitedUser = await limitEncDetaFromServe(limitedUser);
  let userID = user._id;
  let superReferredUID = user.superReferredUID;
  const isVIP_data = await checkVIPStatus(userID, superReferredUID);
  if (isVIP_data !== limitedUser.isVIP) {
    limitedUser.isVIP = isVIP_data;
  }


let FieldsArray = [
      "firstName",
      "lastName",
      "gender",
      "userTitle",
      "interests",
      "role",
      "location",
    ];
    limitedUser = HTMLspecialChars.decode(limitedUser, FieldsArray, "+");

  res.status(201).json({
    status: "success",
    token,
    resource: "user",
    action: "loggedIn",
    lenght: user.length,
    data: limitedUser,
  });
});

const serverPassword = process.env.SERVER_PASSWORD; // Securely load the server password from environment variables

export const protect = asyncErrorHandler(async (req, res, next) => {
  try {
    // 1. Read the token from the request header
    const token = req.headers.authorization;

    if (!token) {
      return next(new CustomError("You are not logged in!", 401));
    }

    // 2. Decode the token and extract user details
    const decodedToken = await GetUserDetailsFromHeader(token);
    if (!decodedToken) {
      return next(new CustomError("Invalid token. Please login again.", 401));
    }

    // 3. Verify token type and handle user-agent for Bearer tokens
    // console.log(`token.split(" ")[0]:`, token.split(" ")[0]);
    if (token.split(" ")[0] === "Bearer") {
      const currentUserAgent = req.headers["user-agent"];
      if (!currentUserAgent) {
        return next(new CustomError("User-Agent header is missing", 400));
      }

      const isSameUserAgent = await bcrypt.compare(
        currentUserAgent,
        decodedToken.wizard
      );
      if (!isSameUserAgent) {
        return next(
          new CustomError("Device mismatch. Please login again", 417)
        );
      }

      console.log(
        // req.cookie.addysmartClientUserLoginId
        // " req.cookie.addysmartClientUserLoginId",
        " req.cookies",
        req.cookies
      );
      const isProduction = process.env.NODE_ENV === "production";
      //   if (
      //     isProduction &&
      //     decodedToken.addysmartClientUserLoginId !==
      //       req.cookie.addysmartClientUserLoginId
      //   ) {
      //     return next(
      //       new CustomError("Device secrete mismatch. Please login again", 417)
      //     );
      //   }
    } else if (
      token.split(" ")[0] === "Server" &&
      req.headers.serverpassword === serverPassword
    ) {
      // Server-to-server authentication is allowed
      // console.log("Server-to-server authentication is allowed");
    } else {
      return next(
        new CustomError(
          "Invalid token or device mismatch. Please login again",
          417
        )
      );
    }

    // 4. Check if the user still exists
    let user = await User.findById(decodedToken._id);
    if (!user) {
      return next(
        new CustomError("The user with the given token does not exist", 404)
      );
    }

    console.log("AUTH GOT HERE");
    user = await decodeAndVerifyData(user);

    // 5. If the user has changed the password after the token was issued
    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
    if (isPasswordChanged) {
      return next(
        new CustomError(
          "The password has been changed recently. Please login again",
          401
        )
      );
    }

    // 6. Check if the user has been logged out
    const isLoggedOut = await user.isLoggedOut(decodedToken.iat);
    if (isLoggedOut) {
      return next(
        new CustomError(
          "This account has been logged out from the server recently. Please login again",
          401
        )
      );
    }

    // 7. Check if the user role has changed
    const hasChangedRole = await user.hasChangedRole(decodedToken.iat);
    if (hasChangedRole) {
      return next(
        new CustomError(
          "This user role has changed recently. Please login again",
          401
        )
      );
    }

    // Allow user to access the route
    req.user = user;
    console.log("req.user", req.user);
    next();
  } catch (err) {
    next(err);
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

// // for single role
// export const restrict = (role) => {//wrapper function
//     return (req, res, next) => {
//         if(req.user.role !== role){
//             const error = new CustomError('You do not have permision to perform this action', 403)
//             next(error)
//         }
//         next()
//     }
// }

// // for multiple roles,  we use rest paraameter
// export const restrict = (...role) => {
//   //wrapper function
//   return (req, res, next) => {
//     if (!role.includes(req.user.role)) {
//       const error = new CustomError(
//         "You do not have permision to perform this action",
//         403,
//       );
//       next(error);
//     }
//     next();
//   };
// };

export const restrict = (...roles) => {
  // wrapper function
  return (req, res, next) => {
    const hasPermission = req.user.role.some((userRole) =>
      roles.includes(userRole)
    );

    if (hasPermission) {
      // If user has a valid role, proceed to the next middleware
      return next();
    }

    // If no roles match, return an error
    const error = new CustomError(
      "You do not have permission to perform this action",
      403
    );
    next(error);
  };
};

// // for multiple roles, we use rest paraameter
// exports.restrict = (...role) => {//wrapper function
//     return (req, res, next) => {
//         if(!role.includes(req.user.role)){
//             const error = new CustomError('You do not have permision to perform this action', 403)
//             next(error)
//         }
//         next()
//     }
// }

export const forgotpassword = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);

  //1 CONFIRM IF A USER WITH THAT EMAIL EXIST IN DB
  // const user = await User.findOne({email: req.body.username, phone: req.body.username})// for phone or email login system
  // const user = await User.findOne({email: req.body.email, phone: req.body.email})// for phone or email

  const user = await User.findOne({ email: req.body.email }); // for phone or email
  if (!user) {
    const error = new CustomError(
      `We could not find a user with the given email (${req.body.email})`,
      404
    );
    next(error);
  }
  //2 GENERATE A RANDOM TOKEN FOR THE USER
  const resetToken = await user.createResetPasswordToken();

  console.log("resetToken", resetToken);
  // this saves the encrypted token and the expiry date generated in user.createResetPasswordToken() and {validateBeforeSave: false} prevents validation
  if (await user.save({ validateBeforeSave: false })) {
    // console.log('user updated successfully')
  } else {
    // console.log('user update failed')
  }
  //4 SEND THE TOKEN TO THE USER VIA EMAIL

  const resetUrl = `${req.protocol}://${Client_HOST}/resetpass?resetToken=${resetToken}`;
  // const message = `We have recieved a password reset request. Please use the link below to reset your password\n\n ${resetUrl} \n\n
  // this link will be valid for 10 munutes.`

  const message = `<html><body>
    <p>
    Hi ${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""},</p> 
    
    We have recieved your password reset request.
    <p>
    If you need to change your password, your RESET code is:
    </p>
    
    <table align='center' ><tr><td  align='center' style='	color:#FFF; cursor:pointer; padding: 10px 18px; border-radius:10px; background-color:#23BE30;'><b>${resetToken}</b>
        </td></tr></table>
    
    <p>
     This code expires after 10 munites from the request time.
    
    You can also click on 'reset password' below to change your password.
    </p>
    
    <table align='center' ><tr><td  align='center' style='	color:#FFF; cursor:pointer; padding: 10px 18px; border-radius:10px; background-color:#23BE30;'>
    <a href='${resetUrl}'><b>RESET PASSWORD</b></a>
        </td></tr></table>

    WITH ${process.env.ORGNAME.toUpperCase()}, </br>
    MAKING EXTRA INCOME IS ASSURED.
    
      <p>Thank you for choosing ${process.env.ORGNAME.toUpperCase()}.</p>
        <p><b> ${process.env.ORGNAME.toUpperCase()}, <em>${process.env.ORGSLOGAN.toUpperCase()} </em></b>.</p>
        <p>For information on ${process.env.ORGNAME.toUpperCase()}, visit <a href='${
    req.protocol
  }://${HOST}'>${req.protocol}://${Client_HOST}</a></p>
      </body>
    </html>`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset request",
      message: message,
    });
    res.status(200).json({
      status: "success",
      subject: "Password change request recievced",
      message: message,
    });
  } catch (err) {
    // destroy the saved token and then throw error
    user.passwordResetToken = undefined;
    user.passwordResetTokenExp = undefined;
    return next(
      new CustomError(
        `There is an error sending password reset email. Please try again later`,
        500
      )
    );
  }
});

export const resetpassword = asyncErrorHandler(async (req, res, next) => {
  console.log("resetpassword called");
  req.body = HTMLspecialChars.encode(req.body);
  if (req.body.confirmPassword !== req.body.password) {
    const error = new CustomError(
      "Password and confirmPassword does not match!",
      400
    );
    return next(error);
  }
  const cryptotoken = crypto
    .createHash("sha256")
    .update(req.params.Token)
    .digest("hex");
  let user = await User.findOne({
    passwordResetToken: cryptotoken,
    passwordResetTokenExp: { $gt: Date.now() },
  });

  if (!user) {
    let userx = await User.findOne({ passwordResetToken: cryptotoken });
    if (userx) {
      // there is a pasward reset token, delete it
      userx = await decodeAndVerifyData(userx);
      userx.password = req.body.password;
      userx.passwordResetToken = undefined;
      userx.passwordResetTokenExp = undefined;
      userx.save();
    }

    const error = new CustomError("Token is invalid or has expired", 404);
    next(error);
  }

  user = await decodeAndVerifyData(user);
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordChangedAt = Date.now();
  user.passwordResetToken = undefined;
  user.passwordResetTokenExp = undefined;

  user.save(); // we want to allow validation

  const token = signToken(user._id, user.email, user.role);

  ///
  //4 SEND THE TOKEN TO THE USER VIA EMAIL

  const message = `<html><body>
    <p>
    Hi ${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""},</p> 
    
    Your password has been reset succesffully.
    <p>
    Please notify us at ${
      process.env.ORGEMAIL_SUPPORT
    } if you did not perform this password reset:
    </p>
    

    
    WITH ${process.env.ORGNAME.toUpperCase()}, </br>
    MAKING EXTRA INCOME IS ASSURED.
    
  <p>Thank you for choosing ${process.env.ORGNAME.toUpperCase()}.</p>
        <p><b> ${process.env.ORGNAME.toUpperCase()}, <em>${process.env.ORGSLOGAN.toUpperCase()} </em></b>.</p>
        <p>For information on ${process.env.ORGNAME.toUpperCase()}, visit <a href='${
    req.protocol
  }://${HOST}'>${req.protocol}://${Client_HOST}</a></p>
      </body>
    </html>`;

  let emailverificationMessage;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset request",
      message: message,
    });
    emailverificationMessage = `Password reset mail successfull.`;
  } catch (err) {
    // return next(new CustomError(`There is an error sending password reset email. Please try again later`, 500))
    emailverificationMessage = `Password reset mail failed.`;
  }
  ///

  res.status(201).json({
    status: "success",
    token,
    emailverificationMessage,
    resource: "user",
    action: "password-reset",
  });
});

export const changePassword = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);

  const password = req.body.oldpassword;
  if (req.body.confirmPassword !== req.body.password) {
    const error = new CustomError(
      "Password and confirmPassword does not match!",
      400
    );
    return next(error);
  }

  if (req.body.email) {
    const error = new CustomError(
      `Unauthorized action detected, you can not change email through this link`,
      404
    );
  }
  const testToken = req.headers.authorization;
  // const decodedToken = await GetUserDetailsFromHeader(testToken);

  let user = await User.findById(req.user._id).select("+password");
  user = await decodeAndVerifyData(user);

  let repass = await user.comparePasswordInDb(password, user.password);

  // handle brut
  if (user.failedLogginAttempts < 5) {
    if (!user || !(await user.comparePasswordInDb(password, user.password))) {
      user.failedLogginAttempts += 1;
      user.lastAttemptTime = new Date();
      await user.save({ validateBeforeSave: false });
      const error = new CustomError(
        `Incorrect login details, ${
          5 - user.failedLogginAttempts
        } attempt(s) left`,
        400
      );
      return next(error);
    } else {
      user.failedLogginAttempts = 0;
      user.lastAttemptTime = new Date();
      await user.save({ validateBeforeSave: false });
    }
  } else if (new Date() - user.lastAttemptTime > 1800000) {
    // 30 min after last failled attempt
    // cancel prev attempt records
    user.failedLogginAttempts = 0;
    user.lastAttemptTime = new Date();
    await user.save({ validateBeforeSave: false });

    //validate new login attempt
    if (!user || !(await user.comparePasswordInDb(password, user.password))) {
      user.failedLogginAttempts = 1;
      user.lastAttemptTime = new Date();
      await user.save({ validateBeforeSave: false });
      const error = new CustomError("Incorrect login details", 400);
      return next(error);
    } else {
      user.failedLogginAttempts = 0;
      user.lastAttemptTime = new Date();
      await user.save({ validateBeforeSave: false });
    }
  } else {
    const error = new CustomError(
      "Incorrect login details or temprarily blocked",
      400
    );
    return next(error);
  }

  if (user) {
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.password = req.body.password;
    user.passwordChangedAt = Date.now();
    user.passwordResetToken = undefined;
    user.passwordResetTokenExp = undefined;
    user.save(); // we want to allow validation
  }

  res.status(200).json({
    status: "success",
    resource: "user",
    action: "password change",
  });
});

export const updateUserToggleRole = asyncErrorHandler(
  async (req, res, next) => {
    const testToken = req.headers.authorization;
    const decodedToken = await GetUserDetailsFromHeader(testToken);

    const user = await User.findById(req.params._id);

    if (!user) {
      const error = new CustomError(
        `User with ID: ${req.params._id} is not available`,
        404
      );
      return next(error);
    }

    if (user) {
      if (
        decodedToken.role.includes("supreme") &&
        ["superAdmin", "admin", "headAcountant", "accountant"].includes(
          req.user.role
        )
      ) {
        if (user.role.includes(req.user.role)) {
          let newRoleArray = [];
          user.role.map(function (role) {
            if (role !== req.user.role) {
              newRoleArray.push(role);
            }
          });

          user.role = [...newRoleArray];
        } else {
          user.role = user.role.push(req.user.role);
        }
        user.roleChangedAt = Date.now();
        await user.save({ validateBeforeSave: false });
      } else if (
        decodedToken.role.includes("superAdmin") &&
        ["admin", "headAcountant", "accountant"].includes(req.user.role)
      ) {
        if (user.role.includes(req.user.role)) {
          let newRoleArray = [];
          user.role.map(function (role) {
            if (role !== req.user.role) {
              newRoleArray.push(role);
            }
          });

          user.role = [...newRoleArray];
        } else {
          user.role = user.role.push(req.user.role);
        }
        user.roleChangedAt = Date.now();
        await user.save({ validateBeforeSave: false });
      } else {
        const error = new CustomError(
          `You are not authorized to perform this action`,
          404
        );
        return next(error);
      }
    }

    limitedUser = limitUserDetailsServeFields(user);

    res.status(200).json({
      status: "success",
      resource: "user",
      action: "roletoggle",
      lenght: user.length,
      data: limitedUser,
    });
  }
);

export const getUsers = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(User.find(), req.query)
    .countDocuments()
    .filter()
    .sort()
    .limitfields()
    .paginate();

  // Execute the query and get the result
  let resUsers = await features.query;

  // Get the total count of records
  let totalCount = await features.totalCountPromise;

  req.query.page && paginationCrossCheck(resUsers.length);

  resUsers = await Promise.all(
    resUsers.map(async (data) => {
      data = limitUserDetailsServeFields(data);
      data = updateResponseFilePathsWithHostName(data, HOST);
      data = await decodeAndVerifyData(data);
      data = await limitEncDetaFromServe(data); // Verify the data data
      data = HTMLspecialChars.decode(data);
      return data; // Return the verified data
    })
  );

  res.status(200).json({
    status: "success",
    resource: "users",
    RecordsEstimate: totalCount,
    lenght: resUsers.length,
    data: resUsers,
  });
});

export const searchUsers = asyncErrorHandler(async (req, res, next) => {
  let features = new ApiFeatures(
    User.find({
      $or: [
        { email: { $regex: "^" + req.query.search } },
        { firstName: { $regex: "^" + req.query.search } },
        { middleName: { $regex: "^" + req.query.search } },
        { lastName: { $regex: "^" + req.query.search } },
      ],
    }),
    req.query
  )
    .limitfields()
    .paginate();

  let resUsers = await features.query;

  req.query.page && paginationCrossCheck(user.length);

  resUsers = await Promise.all(
    resUsers.map(async (data) => {
      data = limitUserDetailsServeFields(data);
      data = updateResponseFilePathsWithHostName(data, HOST);
      data = await decodeAndVerifyData(data);
      data = await limitEncDetaFromServe(data); // Verify the data data
      data = HTMLspecialChars.decode(data);
      return data; // Return the verified data
    })
  );

  res.status(200).json({
    status: "success",
    resource: "users",
    lenght: resUsers.length,
    data: resUsers,
  });
});

export const getUser = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.params._id);
  if (!user) {
    const error = new CustomError(
      `User with ID: ${req.params._id} is not found`,
      404
    );
    //return to prevent further execution of the rest of the codes
    return next(error);
  }

  limitedUser = limitUserDetailsServeFields(user);
  limitedUser = updateResponseFilePathsWithHostName(limitedUser, HOST);
  limitedUser = HTMLspecialChars.decode(limitedUser);

  res.status(200).json({
    status: "success",
    resource: "user",
    lenght: limitedUser.length,
    data: limitedUser,
  });
});

export const getMe = asyncErrorHandler(async (req, res, next) => {
  const testToken = req.headers.authorization;

  // Decode token to get user details
  // const decodedToken = await GetUserDetailsFromHeader(testToken);

  // Fetch user based on decoded token
  const user = await User.findById(req.user._id);

  if (!user) {
    // Create and return an error if the user is not found
    const error = new CustomError(
      `User with ID: ${req.user._id} is not found`,
      404
    );
    return next(error); // Return to prevent further code execution
  }

  // VIP status check: ensure it's done if last check is outdated
  // console.log("!user.lastIsVipCheck", !user.lastIsVipCheck);
  // console.log("user.lastIsVipCheck < Date.now()", user.lastIsVipCheck < Date.now());
  if (!user.lastIsVipCheck || user.lastIsVipCheck < Date.now()) {
    const userID = user._id;
    const superReferredUID = user.superReferredUID;

    // Check if user is VIP
    const isVIP_data = await checkVIPStatus(userID, superReferredUID);

    console.log("lastIsVipCheck user", user);
    // Update user's VIP status if they are now VIP
    user.isVIP = isVIP_data;
    user.lastIsVipCheck = Date.now() + 1 * 60 * 60 * 1000; // 1 hour in milliseconds

    await user.save({ validateBeforeSave: false });
    console.log("lastIsVipCheck user 2", user);
  }

  let limitedUser = "";
  if (req.headers.authorization.split(" ")[0] === "Bearer") {
    limitedUser = limitUserDetailsServeFields(user);
    limitedUser = updateResponseFilePathsWithHostName(limitedUser, HOST);
    limitedUser = await decodeAndVerifyData(limitedUser);
    limitedUser = await limitEncDetaFromServe(limitedUser); // Verify the data data
  } else {
    limitedUser = user.toObject ? user.toObject() : { ...user };
  }
    let FieldsArray = [
      "firstName",
      "lastName",
      "gender",
      "userTitle",
      "interests",
      "role",
      "location",
    ];
    limitedUser = HTMLspecialChars.decode(limitedUser, FieldsArray, "+");

  // Send response
  res.status(200).json({
    status: "success",
    resource: "user",
    length: Object.keys(limitedUser).length, // Correct the length to match limited user details
    data: limitedUser,
  });
});

export const patchMe = asyncErrorHandler(async (req, res, next) => {
  // Encode each field in req.body to prevent HTML injection attacks
  Object.keys(req.body).forEach((key) => {
    req.body[key] = HTMLspecialChars.encode(req.body[key]);
  });

  // Check for unauthorized fields
  if (req.body.password || req.body.email || req.body.referred) {
    return next(
      new CustomError(
        `Unauthorized action detected. You cannot change email, password, or referee through this endpoint.`,
        403
      )
    );
  }

  // Attempt to find and update the user with only permitted fields
  let user = await User.findById(req.user._id);

  if (!user) {
    return next(
      new CustomError(`User with ID: ${req.user._id} not found`, 404)
    );
  }

  // Update allowed fields
  const { firstName, lastName, gender, userTitle } = req.body;
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.gender = gender || user.gender;
  user.userTitle = userTitle || user.userTitle;

  // Save the updated user document
  await user.save({ validateBeforeSave: false });

  // Process and limit user fields in response
  let limitedUser = limitUserDetailsServeFields(user.toObject());
  limitedUser = updateResponseFilePathsWithHostName(limitedUser, HOST);
  limitedUser = await decodeAndVerifyData(limitedUser);
  limitedUser = await limitEncDetaFromServe(limitedUser); // Verify the data data

  let FieldsArray = [
    "firstName",
    "lastName",
    "gender",
    "userTitle",
    "interests",
    "role",
    "location",
  ];
  limitedUser = HTMLspecialChars.decode(limitedUser, FieldsArray, "+");

  res.status(200).json({
    status: "success",
    resource: "user",
    action: "patch",
    length: limitedUser ? Object.keys(limitedUser).length : 0,
    data: limitedUser,
  });
});


export const putMe = asyncErrorHandler(async (req, res, next) => {
  console.log("PUTME RAN");

  // Encode each field in req.body to prevent HTML injection attacks
  Object.keys(req.body).forEach((key) => {
    req.body[key] = HTMLspecialChars.encode(req.body[key]);
  });

  // Check for unauthorized fields
  if (req.body.password || req.body.email || req.body.referred) {
    return next(
      new CustomError(
        `Unauthorized action detected. You cannot change email, password, or referee through this endpoint.`,
        403
      )
    );
  }

  // Attempt to find and update the user with only permitted fields
  let user = await User.findById(req.user._id);

  if (!user) {
    return next(
      new CustomError(`User with ID: ${req.user._id} not found`, 404)
    );
  }

  // Update allowed fields
  const { firstName, lastName, gender, userTitle } = req.body;
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.gender = gender || user.gender;
  user.userTitle = userTitle || user.userTitle;

  // Save the updated user document
  await user.save({ validateBeforeSave: false });

  // Process and limit user fields in response
  let limitedUser = limitUserDetailsServeFields(user.toObject());
  limitedUser = updateResponseFilePathsWithHostName(limitedUser, HOST);
  limitedUser = await decodeAndVerifyData(limitedUser);
  limitedUser = await limitEncDetaFromServe(limitedUser); // Verify the data data

    
  let FieldsArray = [
    "firstName",
    "lastName",
    "gender",
    "userTitle",
    "interests",
    "role",
    "location",
  ];
  limitedUser = HTMLspecialChars.decode(limitedUser, FieldsArray, "+");

  res.status(200).json({
    status: "success",
    resource: "user",
    action: "put",
    length: limitedUser ? Object.keys(limitedUser).length : 0,
    data: limitedUser,
  });
});

export const logOutAll = asyncErrorHandler(async (req, res, next) => {
  // const testToken = req.headers.authorization;
  // const decodedToken = await GetUserDetailsFromHeader(testToken);

  const user = await User.findById(req.user._id);

  if (!user) {
    const error = new CustomError(
      `User with ID: ${req.user._id} is not available`,
      404
    );
    return next(error);
  }

  if (user) {
    user.loggedOutAllAt = Date.now();
    let loggedout = await user.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: "success",
    resource: "user",
    action: "logout all",
  });
});

export const adminPutUser = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  if (req.body.password || req.body.email) {
    const error = new CustomError(
      `Unauthorized action detected, you can not change email or password through this link`,
      404
    );
  }
  // const user = await user.find({_id: req.param._id})
  const user = await User.findByIdAndUpdate(req.params._id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    const error = new CustomError(
      `User with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }
  limitedUser = limitUserDetailsServeFields(user);
  limitedUser = updateResponseFilePathsWithHostName(limitedUser, HOST);

  res.status(200).json({
    status: "success",
    resource: "user",
    action: "update",
    lenght: user.length,
    data: limitedUser,
  });
});

export const adminPatchUser = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  if (req.body.password || req.body.email) {
    const error = new CustomError(
      `Unauthorized action detected, you can not change email or password through this link`,
      404
    );
  }
  // const user = await user.find({_id: req.param._id})
  const user = await User.findByIdAndUpdate(req.params._id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    const error = new CustomError(
      `User with ID: ${req.params._id} is not found`,
      404
    );
    return next(error);
  }
  limitedUser = limitUserDetailsServeFields(user);
  limitedUser = updateResponseFilePathsWithHostName(limitedUser, HOST);

  res.status(200).json({
    status: "success",
    resource: "user",
    action: "update",
    lenght: user.length,
    data: limitedUser,
  });
});

export const deleteUser = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params._id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    const error = new CustomError(
      `User with ID: ${req.params._id} is not available`,
      404
    );
    return next(error);
  }

  //// unlink single files
  if (user.profileImg) {
    UnlinkSingleFile(user.profileImg, req);
  }
  res.status(204).json({
    status: "success",
    resource: "user",
    message: "deleted",
  });
});

export const approveUser = asyncErrorHandler(async (req, res, next) => {
  req.body = HTMLspecialChars.encode(req.body);
  const user = await User.findById(req.params._id);

  if (!user) {
    const error = new CustomError(
      `User with ID: ${req.params._id} is not found`,
      404
    );
    next(error);
  }

  if (req.query.action === "approveTrue") {
    user.approved = true;
  } else if (req.query.action === "approveFalse") {
    user.approved = false;
  } else {
    user.approved = true;
  }
  await user.save({ validateBeforeSave: false });

  // UPDATE EQUIRY STARTS
  // using or together with and
  let enquiry = await Enquiry.find({
    $or: [
      { $and: [{ Email: user.email }, { prospect: true }] },
      { $and: [{ phone: user.phone }, { prospect: true }] },
      { $and: [{ Email: user.email }, { prospect: "true" }] },
      { $and: [{ phone: user.phone }, { prospect: "true" }] },
    ],
  });

  if (enquiry.length > 0) {
    const enquiry2 = await Enquiry.findByIdAndUpdate(
      enquiry[0]._id,
      { prospect: false },
      { new: true, runValidators: true }
    );
  }
  // UPDATE EQUIRY ENDS

  // UPDATE OR CREATE STATS STARTS

  if (req.query.action === "approveTrue") {
    await StatusStatsHandler(
      "approveTrue",
      "approveTrue",
      "approveTrue",
      false
    );
  } else if (req.query.action === "approveFalse") {
    await StatusStatsHandler(
      "approveFalse",
      "approveFalse",
      "approveFalse",
      false
    );
  } else {
    await StatusStatsHandler(
      "approveTrue",
      "approveTrue",
      "approveTrue",
      false
    );
  }

  // UPDATE OR CREATE STATS ENDS
  //4 SEND THE NOTICE TO THE USER VIA EMAIL

  const message = `<html><body>
    <p>
    Hi ${user.firstName} ${user.middleName} ${user.lastName},</p> 
    
    This is to notify you that your account with ${process.env.ORGNAME.toUpperCase()} has been VERIFIED.


    
    WITH ${process.env.ORGNAME.toUpperCase()}, </br>
    MAKING EXTRA INCOME IS ASSURED.
    
  <p>Thank you for choosing ${process.env.ORGNAME.toUpperCase()}.</p>
        <p><b> ${process.env.ORGNAME.toUpperCase()}, <em>${process.env.ORGSLOGAN.toUpperCase()} </em></b>.</p>
        <p>For information on ${process.env.ORGNAME.toUpperCase()}, visit <a href='${
    req.protocol
  }://${HOST}'>${req.protocol}://${Client_HOST}</a></p>
      </body>
    </html>`;

  let userApprovalMessage;
  try {
    await sendEmail({
      email: user.email,
      subject: "Usere account approval",
      message: message,
    });
    userApprovalMessage = `User account approval mail successfull.`;
  } catch (err) {
    // return next(new CustomError(`There is an error sending Usere account approval mail. Please try again later`, 500))
    userApprovalMessage = `User account approval mail failed.`;
  }
  ///

  limitedUser = limitUserDetailsServeFields(user);
  limitedUser = updateResponseFilePathsWithHostName(limitedUser, HOST);

  res.status(201).json({
    status: "success",
    userApprovalMessage,
    resource: "user",
    action: "account approved",
    data: limitedUser,
  });
});

export const fileToProfileImgPath = asyncErrorHandler(
  async (req, res, next) => {
    SetUploadsfilePathHandler(req, `./uploads/profileImgs`);
    next();
  }
);
