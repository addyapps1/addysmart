import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CampaignPerformanceDataSchema = new Schema({
  adId: {
    type: String,
    required: true,
    unique: true,
    ref: "OrganicSubscription",
  },

  data: [
    {
      date: { type: Date, required: true, default: Date.now },
      totalFollowersGained: { type: Number, default: 0 },
      totalSubscribersGained: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
      totalImpressions: { type: Number, default: 0 }, // Number of times the ad was viewed today
      totalClicks: { type: Number, default: 0 }, // Number of clicks on the ad today
      totalConversions: { type: Number, default: 0 }, // Conversions today (e.g., purchases, sign-ups)
    },
  ],

  updated: {
    type: Date,
    default: Date.now,
  },
  releaseDate: { type: Date, default: Date.now, required: true, trim: true },
  created: { type: Date, default: Date.now, immutable: true, trim: true },
});

export default model("campaignPerformance", CampaignPerformanceDataSchema);