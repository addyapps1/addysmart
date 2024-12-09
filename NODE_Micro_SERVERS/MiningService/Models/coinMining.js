import mongoose from "mongoose";
import crypto from "crypto";
import fs from "fs";
import AutoLogFile from "../Utils/AutoLogFile.js";
import * as SymmetricEncryption from "../Utils_Enc/SYMMETRIC_encryptionUtils.js";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

const { Schema, model } = mongoose;

const myMilisec = (days) => {
  return days * 24 * 60 * 60 * 1000;
};

const coinsMiningSchema = new Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  activity: { type: String, required: true },
  coins: { type: Number, required: true },
  VideoId: { type: mongoose.Schema.Types.ObjectId, required: true },
  Watchcode: { type: String, required: true },
  nextViewTime: { type: Number, required: true },
  month: { type: Number, required: true },
  day: { type: Number, required: true },

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
  releaseDate: { type: Date, default: Date.now, required: true, trim: true },
  created: { type: Date, default: Date.now, immutable: true, trim: true },
  updated: { type: Date, default: Date.now, trim: true, select: false },
});

// USING MONGOOSE MIDDLEWARE
// Post hook
coinsMiningSchema.post("save", async function (doc, next) {
  const logFile = await AutoLogFile();
  const content = `A new coin mining document of ${doc.coins} created by ${doc.createdBy} on ${doc.created}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

coinsMiningSchema.pre(/^find/, async function (next) {
  // Note: this model will not serve anything that is not up to its release date
  // else remove this middleware
  this.find({ releaseDate: { $lte: Date.now() } });
  this.startTime = Date.now();
  next();
});

coinsMiningSchema.post(/^find/, async function (docs, next) {
  this.endTime = Date.now();
  const logFile = await AutoLogFile();
  const content = `Query took  ${
    this.endTime - this.startTime
  } in milliseconds to fetch the documents, on ${new Date()}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

// AGGREGATION MIDDLEWARES
coinsMiningSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } });
  next();
});

coinsMiningSchema.pre("save", async function (next) {
  // The user can validly rewatch the video after 24 hrs
  this.nextViewTime = Date.now() + myMilisec(1);
  next();
});


// Middleware to update the 'updated' field
coinsMiningSchema.pre("save", function (next) {
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
  //   if (key !== "encData" && key !== "__v") {
  //     delete this[key];
  //   }
  // }

  next(); // Proceed with saving the document
});


coinsMiningSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
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


const CoinsMining = model("coinMining", coinsMiningSchema);
export default CoinsMining;