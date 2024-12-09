import mongoose from "mongoose";
import fs from "fs";
import AutoLogFile from "../Utils/AutoLogFile.js";

const { Schema, model } = mongoose;

const affiliateProductsSchema = new Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  link: { type: String, required: true, unique: true },
  files: {
    type: [Object], // Assuming you want an array of objects
    // required: true
  },
  releaseDate: { type: Date, default: Date.now, required: true, trim: true },
  created: { type: Date, default: Date.now, immutable: true, trim: true },
  updated: { type: Date, default: Date.now, trim: true, select: false },
});

// USING MONGOOSE MIDDLEWARE
// Post hook
affiliateProductsSchema.post("save", async function (doc, next) {
  const logFile = await AutoLogFile();
  const content = `A new affiliate product document created by ${doc.createdBy} on ${doc.created}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

affiliateProductsSchema.pre(/^find/, async function (next) {
  // Note: this model will not serve anything that is not up to its release date
  // else remove this middleware
  this.find({ releaseDate: { $lte: Date.now() } });
  this.startTime = Date.now();
  next();
});

affiliateProductsSchema.post(/^find/, async function (docs, next) {
  this.endTime = Date.now();
  const logFile = await AutoLogFile();
  const content = `Query took  ${
    this.endTime - this.startTime
  } in milliseconds to fetch the documents, on ${new Date()}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

// AGGREGATION MIDDLEWARES
affiliateProductsSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } });
  next();
});

export default model("externalContent", affiliateProductsSchema);
