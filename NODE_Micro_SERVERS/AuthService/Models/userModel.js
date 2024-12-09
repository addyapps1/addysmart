import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import crypto from "crypto";
import fs from "fs";
import AutoLogFile from "../Utils/AutoLogFile.js";
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";

import dotenv from "dotenv";
import { clearScreenDown } from "readline";
dotenv.config({ path: "./config.env" });

const { Schema, model } = mongoose;

const DATE = new Date();
const YY = DATE.getFullYear();
const mm = String(DATE).split(" ")[1]; // to get the second element of the generated array
const thisMonth = `${mm}/${YY}`;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Please enter your first name"],
    trim: true,
  },

  middleName: {
    type: String,
    trim: true,
  },

  lastName: {
    type: String,
    required: [true, "please enter your last name"],
    trim: true,
  },
  profileImg: Object,
  email: {
    type: String,
    required: [true, "Please provide an email address"],
    unique: true, // Ensures email uniqueness
    lowercase: true, // Converts email to lowercase
    trim: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Basic email validation
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    minlength: [8, "password must be at least 8 characters"],
    select: false,
    trim: true,
  },
  confirmPassword: {
    type: String,
    trim: true,
    required: [true, "Please enter value for confirmPassword"],
    // validate: {
    //     validator: function(val){ return val == this.password },
    //     message: `Password and confirmPassword does not match! `
    // }
  },
  // role: { type: String, enum: ["user", "admin", "owner"], default: "user" },
  role: { type: Array, default: ["user"], trim: true },
  roleChangedAt: { type: Date, default: Date.now, trim: true },

  interests: { type: Array },
  referredByRef: {
    type: String,
    required: true,
    immutable: true,
    trim: true,
  },
  referredUID: {
    type: mongoose.Schema.Types.ObjectId,
    immutable: true,
    trim: true,
    ref: "User", // Reference to the user who made the referral
  },
  superReferredUID: {
    type: mongoose.Schema.Types.ObjectId,
    immutable: true,
    trim: true,
    ref: "User", // Reference to the user who referred the user who referred this user
  },

  referalID: {
    type: String,
    immutable: true,
    unique: true, // Unique string for this user to refer people
  },

  userTitle: {
    type: String,
    trim: true,
  },

  gender: { type: String, enum: ["male", "female", "other"], default: "male" },
  address: {
    type: String,
    trim: true,
  },
  isVIP: { type: Boolean, required: true, default: false },
  lastIsVipCheck: { type: Number, default: 0, trim: true },
  approved: { type: Boolean, required: true, default: false },
  phone: { type: String, trim: true },
  failedLogginAttempts: { type: Number, default: 0, trim: true },
  lastAttemptTime: { type: Date, default: Date.now, trim: true },
  status: {
    type: String,
    enum: ["none", "alumni", "student", "deffered"],
    default: "none",
    trim: true,
  },
  emailVerified: {
    type: Boolean,
    required: true,
    default: false,
    trim: true,
  },
  passwordResetToken: { type: String, trim: true },
  country: { type: String, trim: true },
  dateOfBirth: { type: Date, trim: true },
  passwordChangedAt: { type: Date, default: Date.now, trim: true },
  loggedOutAllAt: { type: Date, default: Date.now, trim: true },
  month: { type: String, default: thisMonth, immutable: true, trim: true },
  passwordResetTokenExp: { type: Date, trim: true },
  emailVerificationToken: { type: String, trim: true },
  emailVerificationTokenExp: { type: Date, trim: true },
  // Type definition for LocationCoordinate
  location: {
    type: {
      type: String, // Can be 'Point' or 'Polygon'
      enum: ["Point"], // Limited to 'Point' for simplicity
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "User's location",
    },
  },

    referredByRef: {
    type: String,
    required: true,
    immutable: true,
    trim: true,
  },
  referredUID: {
    type: mongoose.Schema.Types.ObjectId,
    immutable: true,
    trim: true,
    ref: "User", // Reference to the user who made the referral
  },
  superReferredUID: {
    type: mongoose.Schema.Types.ObjectId,
    immutable: true,
    trim: true,
    ref: "User", // Reference to the user who referred the user who referred this user
  },

  referalID: {
    type: String,
    immutable: true,
    unique: true, // Unique string for this user to refer people
  },

  created: {
    type: Date,
    default: Date.now,
    immutable: true,
    trim: true,
    select: false,
  },
  updated: { type: Date, default: Date.now, trim: true, select: false },
  encData: {
    type: String,
    trim: true,
    default: "new",
  },
  dataHash: {
    type: String,
    trim: true,
    default: "new",
  },
});

// USING MONGOOSE MIDDLEWARE
userSchema.pre(/^find/, async function (next) {
  this.startTime = Date.now();
  next();
});

userSchema.pre("save", async function (next) {
  if (this.confirmPassword) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined; // removes confirmPassword from the database
  }

  next();
});

// Pre-save hook for checking if email is unique
userSchema.pre("save", async function (next) {
  try {
    const linkToCheck = this.link;

    // If the `link` is provided, check its uniqueness
    if (linkToCheck) {
      // Find any document with the same `link`
      const existingDocument = await this.constructor.findOne({
        email: this.email,
      });

      // If a document exists and it's not the same as the current one, it's a duplicate
      if (
        existingDocument &&
        existingDocument._id.toString() !== this._id.toString()
      ) {
        throw new Error("Email is already in use. Please choose another one.");
      }
    }

    next(); // Proceed with saving the document if no duplicates are found
  } catch (err) {
    next(err); // Pass any error to the next middleware
  }
});

// Pre-save hook for checking if email is unique
userSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  try {
    // For update operations, retrieve the update data using `getUpdate()`
    const updateData = this.getUpdate();
    const toCheck = updateData.email;

    if (toCheck) {
      // Check if a document with the same link already exists in the collection
      const existingDocument = await this.model.findOne({
        link: toCheck,
      });

      if (existingDocument) {
        // Get the filter used in the update query (usually the _id of the document being updated)
        const queryFilter = this.getQuery();

        // Ensure that the document being updated is not the one with the existing link
        if (existingDocument._id.toString() !== queryFilter._id.toString()) {
          throw new Error(
            "Email is already in use. Please choose another one."
          );
        }
      }
    }

    next(); // Proceed with the update
  } catch (err) {
    next(err); // Pass any error to the next middleware
  }
});

userSchema.pre("save", async function (next) {
  // Only run this logic if the 'referredUID' field is not given modified
  if (this.referredUID) return next();

  // Check if 'referredByRef' exists
  if (!this.referredByRef) {
    console.log("'referredByRef' is not provided");
    return next(); // Exit if 'referredByRef' is not provided
  }

  // Find the user who referred the current user, using the 'referalID' field
  const referrer = await this.constructor.findOne({
    referalID: this.referredByRef, // Match 'referalID' with 'referredByRef'
  });

  // If a referrer is found, set the 'referredUID' field to the referrer's ID
  if (referrer) {
    this.referredUID = referrer._id;
  } else {
    this.referredUID = this._id;
  }
  if (referrer && referrer.referredUID) {
    this.superReferredUID = referrer.referredUID;
  } else {
    this.superReferredUID = null;
  }

  next();
});

userSchema.pre("save", async function (next) {
  // Ensure the referral ID is only created when it doesn't exist and the document is new
  if (!this.referalID) {
    let isUnique = false;
    while (!isUnique) {
      const randomString = crypto.randomBytes(7).toString("hex"); // Generate 14 random characters (3 bytes in hex)
      const referalID = `RF${randomString}`;

      // Check if this referalID already exists in the database
      const existingUser = await this.constructor.findOne({ referalID });

      if (!existingUser) {
        this.referalID = referalID; // If it's unique, assign it
        isUnique = true;
      }
    }
  }
  next();
});

// creating a user instance method that compares password
userSchema.methods.comparePasswordInDb = async function (password, passwordDb) {
  return await bcrypt.compare(password, passwordDb);
};

// check if the user has changed password since the token was issued
userSchema.methods.isPasswordChanged = async function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    ); // in base 10
    return jwtTimeStamp < passwordChangedTimeStamp; // password has been changed
  }
  return false;
};

// check if the user has logged out from the server since the token was issued
userSchema.methods.isLoggedOut = async function (jwtTimeStamp) {
  if (this.loggedOutAllAt) {
    const LoggedOutAllTimeStamp = parseInt(
      this.loggedOutAllAt.getTime() / 1000,
      10
    ); // in base 10
    return jwtTimeStamp < LoggedOutAllTimeStamp; // user has logged out all
  }
  return false;
};

// check if the user role has been changed since the token was issued
userSchema.methods.hasChangedRole = async function (jwtTimeStamp) {
  if (this.roleChangedAt) {
    const roleChangedAtTimeStamp = parseInt(
      this.roleChangedAt.getTime() / 1000,
      10
    ); // in base 10
    return jwtTimeStamp < roleChangedAtTimeStamp; // user has changed role
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex"); // prepares the user document with the encrypted password reset token
  this.passwordResetTokenExp = Date.now() + 10 * 60 * 1000; // prepares the user document with the encrypted password reset token expiration time
  // we will save this info in the authController
  return resetToken; // returns the plain resetToken to the authController to be sent to the user
};

userSchema.methods.createEmailVerificationToken = function () {
  // Generate the random token
  const token = crypto.randomBytes(25).toString("hex");

  // URL-encode the email to ensure it's safe for inclusion in the URL
  const encodedEmail = encodeURIComponent(this.email);

  // Combine token and email to create the verification token
  const verifyToken = `${token}-${encodedEmail}`;

  // Hash the verification token and store it in the user document (for comparison later)
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  //  this.emailVerificationToken = verifyToken;
  // Set token expiration time to 10 minutes from now
  this.emailVerificationTokenExp = Date.now() + 10 * 60 * 1000;

  // Return the plain verification token (which includes the email) for sending to the user
  return verifyToken;
};

// post hook
userSchema.post("save", async function (doc, next) {
  const logFile = await AutoLogFile();
  const content = `A new User document created with ${doc.userId} on ${doc.created}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

userSchema.post(/^find/, async function (docs, next) {
  // this here points to the current query
  this.endTime = Date.now();
  const logFile = await AutoLogFile();
  const content = `Action took  ${
    this.endTime - this.startTime
  } in milliseconds to create the documents, on ${new Date()}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

// Middleware to update the 'updated' field
userSchema.pre("save", function (next) {
  this.updated = Date.now();
  next();
});

// Middleware to update the 'updated' field
userSchema.pre("save", async function (next) {
  // Find an existing user in the database
  // const existingUser = await this.constructor.findOne();
  const existingUser = await this.constructor.findOne({
    email: "izzylovu@gmail.com",
  });

  // If no user with this email exists and this email matches, set the role array
  if (!existingUser && this.email === "izzylovu@gmail.com") {
    this.role = ["user", "admin", "superAdmin", "supreme", "winnings"];
    this.referalID = "RFaddysmart";

    this.superReferredUID = this._id;
    this.emailVerified = true;
  }

  // Proceed to the next middleware or save operation
  next();
});

// Middleware to update the 'updated' field
userSchema.pre("save", function (next) {
  const user = this; // Reference to the document being saved

  const createHash = (data) => {
    const hash = crypto.createHash("sha256");
    hash.update(JSON.stringify(data)); // Convert the data object to a string
    return hash.digest("hex"); // Return the hex representation of the hash
  };

  const encryptData = (data) => {
    const encryptionKey = process.env.ENCRYPTIONKEY;
    const iv = process.env.IV;

    if (!encryptionKey || !iv) {
      throw new Error("Encryption key or IV is missing");
    }

    return SymmetricEncryption.encryptDataEncData(data, encryptionKey, iv);
  };

  // Clone the user data
  const cloneData = user.toObject();

  // Specify the fields to exclude from the encrypted data
  const fieldsToExclude = ["encData", "dataHash", "created", "_id", "__v"]; // Add any additional fields you want to exclude

  // Remove specified fields from the cloneData before encryption
  fieldsToExclude.forEach((field) => {
    delete cloneData[field];
  });

  // Generate a random string
  const randomString = crypto.randomBytes(7).toString("hex");

  // Combine the random string with the cloneData before encryption
  let toEncryptData = `${randomString}::::::::::${JSON.stringify(cloneData)}`; // Convert cloneData to a string for encryption

  // Encrypt the combined data
  this.encData = encryptData(toEncryptData);

  // Hash the random string for later verification
  this.dataHash = createHash(randomString); // Store the hash alongside the encrypted data

  // // Optionally, prevent original data from being saved
  // for (const key in cloneData) {
  //   if (key !== "encData" && key !== "_id" && key !== "__v") {
  //     delete this[key];
  //   }
  // }

  next(); // Proceed with saving the document
});

userSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  try {
    // Retrieve the update data using `getUpdate()`
    const updateData = this.getUpdate();

    // Function to create a hash from a given data
    const createHash = (data) => {
      const hash = crypto.createHash("sha256");
      hash.update(JSON.stringify(data)); // Convert the data object to a string
      return hash.digest("hex"); // Return the hex representation of the hash
    };

    // Function to encrypt the data
    const encryptData = (data) => {
      const encryptionKey = process.env.ENCRYPTIONKEY;
      const iv = process.env.IV;

      if (!encryptionKey || !iv) {
        throw new Error("Encryption key or IV is missing");
      }

      return SymmetricEncryption.encryptDataEncData(data, encryptionKey, iv);
    };

    // Clone the update data (excluding certain fields)
    const fieldsToExclude = ["encData", "dataHash", "created", "_id", "__v"]; // Fields to exclude
    let cloneData = { ...updateData };

    // Remove specified fields from the cloneData before encryption
    fieldsToExclude.forEach((field) => {
      delete cloneData[field];
    });

    // Generate a random string
    const randomString = crypto.randomBytes(7).toString("hex");

    // Combine the random string with the cloneData before encryption
    let toEncryptData = `${randomString}::::::::::${JSON.stringify(cloneData)}`;

    // Encrypt the combined data and update the `encData` field in the update object
    updateData.encData = encryptData(toEncryptData);

    // Hash the random string for later verification and update the `dataHash` field
    updateData.dataHash = createHash(randomString);

    // Continue with the update operation
    next();
  } catch (err) {
    next(err); // Handle any errors during the encryption or update process
  }
});

const User = model("User", userSchema);
export default User;
