import mongoose from "mongoose";

const { Schema, model } = mongoose;

const AdPerformanceDataSchema = new Schema({
  adId: {
    type: String,
    required: true,
    unique: true,
  },

  data: [
    {
      date: { type: Date, required: true, default: Date.now },
      impressions: { type: Number, default: 0 },
      CTA: { type: Number, default: 0 },
      conversions:{ type: Number, default: 0 },
    },
  ],

  updated: {
    type: Date,
    default: Date.now,
  },
  releaseDate: { type: Date, default: Date.now, required: true, trim: true },
  created: { type: Date, default: Date.now, immutable: true, trim: true },
});

export default model("AdPerformanceData", AdPerformanceDataSchema);
