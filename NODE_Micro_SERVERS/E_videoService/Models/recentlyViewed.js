import mongoose from "mongoose";
import fs from "fs";
import AutoLogFile from "../Utils/AutoLogFile.js";
// import User from "./userModel.js";
// import Video from "./externalContents.js";

const { Schema, model } = mongoose;

const myMilisec = (days) => {
  return days * 24 * 60 * 60 * 1000;
};

const recentlyViewedSchema = new Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "E_Video",
  },
  userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  nextViewTime: { type: Number },
  releaseDate: { type: Date, default: Date.now, required: true, trim: true },
  created: { type: Date, default: Date.now, immutable: true, trim: true },
  updated: { type: Date, default: Date.now, trim: true, select: false },
});

// USING MONGOOSE MIDDLEWARE
// Post hook
recentlyViewedSchema.post("save", async function (doc, next) {
  const logFile = await AutoLogFile();
  const content = `A new support document with issueCode ${doc.issueCode} created by ${doc.createdBy} on ${doc.created}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

recentlyViewedSchema.pre(/^find/, async function (next) {
  // Note: this model will not serve anything that is not up to its release date
  // else remove this middleware
  this.find({ releaseDate: { $lte: Date.now() } });
  this.startTime = Date.now();
  next();
});

recentlyViewedSchema.post(/^find/, async function (docs, next) {
  this.endTime = Date.now();
  const logFile = await AutoLogFile();
  const content = `Query took  ${
    this.endTime - this.startTime
  } in milliseconds to fetch the documents, on ${new Date()}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

// AGGREGATION MIDDLEWARES
recentlyViewedSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } });
  next();
});

recentlyViewedSchema.pre("save", async function (next) {
  // The user can validly rewatch the video after 24 hrs
  if (!this.nextViewTime) {
    this.nextViewTime = Date.now() + myMilisec(1);
  }
  next();
});

const RecentlyViewed = model("recentlyViewed", recentlyViewedSchema);
export default RecentlyViewed;