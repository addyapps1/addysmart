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

const balanceSchema = new Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  // userID: { type: mongoose.Schema.Types.ObjectId,  ref: "User" },
  TotalMainCoins: { type: Number, required: true, default: 0 },
  TotalBonusCoins: { type: Number, required: true, default: 0 },
  TotalCurrentCoins: { type: Number, required: true, default: 0 },
  TotalWonBonus: { type: Number, required: true, default: 0 },
  TotalLostBonus: { type: Number, required: true, default: 0 },
  TotalCoinsTobeValued: { type: Number, required: true, default: 0 },
  TotalTaskCompleted: { type: Number, required: true, default: 0 },
  TotalMoneyLeft: { type: Number, required: true, default: 0 },
  dailyMainCoins: { type: Number, required: true, default: 0 },
  dailyBonusCoins: { type: Number, required: true, default: 0 },
  dailyCurrentCoins: { type: Number, required: true, default: 0 },
  dailyTaskCompleted: { type: Number, required: true, default: 0 },
  monthsVIPbonus: { type: Number, required: true, default: 0 },
  dailyWonBonus: { type: Number, required: true, default: 0 },

  month: { type: Number, required: true, default: 0 },
  Day: { type: Number, required: true, default: 0 },
  wonmonth: { type: Number, required: true, default: 0 },
  wonDay: { type: Number, required: true, default: 0 },
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

// Middleware for ensuring atomic operations
balanceSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Additional checks or modifications can be added here
  }
  next();
});

// Pre-save hook for checking if userID is unique
balanceSchema.pre("save", async function (next) {
  try {
    const toCheck = this.userID;

    // If the `userID` is provided, check its uniqueness
    if (toCheck) {
      // Find any document with the same `userID`
      const existingDocument = await this.constructor.findOne({
        userID: this.userID,
      });

      // If a document exists and it's not the same as the current one, it's a duplicate
      if (
        existingDocument &&
        existingDocument._id.toString() !== this._id.toString()
      ) {
        throw new Error("userID must be unique");
      }
    }

    next(); // Proceed with saving the document if no duplicates are found
  } catch (err) {
    next(err); // Pass any error to the next middleware
  }
});

// Pre-save hook for checking if userID is unique
balanceSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  try {
    // For update operations, retrieve the update data using `getUpdate()`
    const updateData = this.getUpdate();
    const toCheck = updateData.userID;

    if (toCheck) {
      // Check if a document with the same link already exists in the collection
      const existingDocument = await this.model.findOne({
        userID: toCheck,
      });

      if (existingDocument) {
        // Get the filter used in the update query (usually the _id of the document being updated)
        const queryFilter = this.getQuery();

        // Ensure that the document being updated is not the one with the existing link
        if (existingDocument._id.toString() !== queryFilter._id.toString()) {
          throw new Error(
            "userID must be unique"
          );
        }
      }
    }

    next(); // Proceed with the update
  } catch (err) {
    next(err); // Pass any error to the next middleware
  }
});


// Log operations
balanceSchema.post("save", async function (doc, next) {
  const logFile = await AutoLogFile();
  const content = `Balance updated for user ${doc.userID} on ${new Date()}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" });
  next();
});

// Pre-find hook
balanceSchema.pre(/^find/, function (next) {
  this.find({ releaseDate: { $lte: Date.now() } });
  next();
});


// Middleware to update the 'updated' field
balanceSchema.pre("save", function (next) {
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


  console.log("cloneData 2b enc", cloneData);

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


balanceSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
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



const Balance = model("Balance", balanceSchema);
export default Balance;
