import mongoose from "mongoose";
import fs from "fs";
import AutoLogFile from "../Utils/AutoLogFile.js";

const DATE = new Date();
const YY = DATE.getFullYear();
const mm = String(DATE).split(" ")[1]; // to get the second element of the generated array
const thisMonth = `${mm}/${YY}`;
const thisMonth2 = `${mm}${YY}`;

const { Schema, model } = mongoose;

const CampaignSchema = new Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  campaignId: { type: String, required: true },
  // Targeting fields
  targetAudience: {
    title: { type: String, required: true },
    matchCriteria: {
      // New field to specify match criteria
      type: String,
      enum: ["All", "Any", "percentage match", "number of matches"], // Options for matching
      default: "All", // Default value
    },
    matchCriteriaValue: { type: Number, default: 0 }, // Example: Threshold for percentage or number of matches
    // Social community and platform details
    platform: {
      type: String,
      required: true,
      enum: {
        values: [
          "YouTube",
          "Instagram",
          "Twitter",
          "Facebook",
          "TikTok",
          "LinkedIn",
          "Other",
        ],
        default: "addysmart",
        message: "{VALUE} is not a valid platform",
      },
    },
    demographics: {
      ageRange: { type: String }, // e.g., "18-24", "25-34"
      gender: {
        type: String,
        enum: ["All", "Male", "Female", "Other"],
        required: true,
      }, // Targeting by gender
      maritalStatus: {
        type: String,
        enum: [
          "All",
          "single",
          "married",
          "dating",
          "divorced",
          "widowed",
          "widower",
        ],
      },
      occupation: {
        type: String,
        enum: [
          "Any",
          "teacher",
          "engineer",
          "doctor",
          "nurse",
          "lawyer",
          "artist",
          "developer",
          "manager",
          "entrepreneur",
          "scientist",
          "accountant",
          "salesperson",
          "chef",
          "writer",
          "musician",
          "student",
          "retired",
          "other", // Add any additional occupations as needed
        ],
      },
    },
    location: { type: String }, // e.g., "New York", "USA"
  },
  interests: [{ type: String }], // List of interests
  behaviors: [{ type: String }], // List of behaviors
  geography: {
    type: {
      type: String, // "Point" or "Polygon"
      enum: ["Point", "Polygon"],
      required: true,
    },
    coordinates: {
      type: [[Number]], // For polygons, an array of arrays
      required: true,
    },
    radius: {
      type: Number, // Radius in meters, applicable for Point type
      required: function () {
        return this.type === "Point";
      },
      min: 0, // Radius cannot be negative
    },
  },

  communityType: {
    type: String,
    enum: ["Social Media", "Forum", "Group", "Channel", "Page"],
    required: true,
  },

  // Subscription order details
  subscriptionType: {
    type: String,
    required: true,
    enum: {
      values: [
        "followers",
        "subscribers",
        "likes",
        "watchtime",
        "engagement",
        "views",
      ],
      message: "{VALUE} is not a valid subscription type",
    },
  },
  quantity: { type: Number, required: true, min: 1 },
  pricePerUnit: { type: Number, required: true },
  totalAmount: { type: Number, required: true },

  // Campaign details
  campaignTitle: { type: String, required: true },
  campaignDescription: { type: String, required: true },
  campaignStartDate: { type: Date, required: true },
  campaignEndDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  maxImpressionsPerDay: { type: Number, required: true, default: null }, // Determines max impressions
  impressionsToday: { type: Number, default: 0 }, // Tracks daily impressions
  lastImpressionReset: { type: Date, default: Date.now }, // Used to reset daily impressions

  // Watchtime details (for video-based subscriptions)
  watchTimeData: {
    totalSecondsWatched: { type: Number, default: 0 }, // Total watch time in seconds
    totalWatchTime: { type: Number, default: 0 }, // Total watch time in minutes
    dailyWatchTime: [
      {
        date: { type: Date, required: true, default: Date.now },
        minutesWatched: { type: Number, default: 0 },
      },
    ],
  },

  Campaigntype: {
    type: String,
    required: true,
    enum: {
      values: [
        "Search Ads", // Ads on search engine results pages (e.g., Google, Bing)
        "Display Ads", // Banner or image ads on websites
        "Social Media Ads", // Ads on platforms like Facebook, Instagram, LinkedIn, Twitter, etc.
        "Video Ads", // Video-based advertisements on platforms like YouTube
        "Email Campaigns", // Promotional email campaigns
        "Native Ads", // Ads that blend into content (often seen in news or media websites)
        "Affiliate Marketing", // Ads run through affiliate partnerships
        "Remarketing Ads", // Ads targeting users who previously interacted with your site or content
        "Influencer Marketing", // Ads or campaigns run through influencers
        "Programmatic Ads", // Automated buying and placement of ads
        "Shopping Ads", // Product listings with prices and descriptions (e.g., Google Shopping)
        "App Install Ads", // Ads promoting the download of mobile applications
        "SMS Campaigns", // Promotional SMS campaigns
        "Audio Ads", // Ads on streaming platforms like Spotify, Pandora, etc.
        "Push Notifications", // Ads sent via browser or app notifications
        "Podcast Sponsorship", // Ads or sponsorships in podcasts
        "Content Marketing", // Creating and promoting content (blogs, articles, etc.)
        "Lead Generation", // Campaigns focused on collecting customer information (e.g., lead forms)
        "Webinar Campaigns", // Campaigns promoting online webinars
        "Survey Campaigns", // Campaigns focused on gathering customer feedback
        "Event Promotion", // Campaigns promoting physical or virtual events
        "Referral Campaigns", // Campaigns encouraging users to refer others
        "Contests & Giveaways", // Campaigns running contests or promotional giveaways
        "Engagement Campaigns", // Campaigns focusing on increasing interaction with content (likes, shares, comments)
      ],
      message: "{VALUE} is not a valid ad type",
    },
  },

  // View details (for tracking daily and total views)
  viewData: {
    totalViews: { type: Number, default: 0 }, // Total views
    dailyViews: [
      {
        date: { type: Date, required: true, default: Date.now },
        views: { type: Number, default: 0 },
      },
    ],
  },
  status: {
    type: String,
    required: true,
    enum: [
      "running",
      "processing",
      "reviewing",
      "pending",
      "completed",
      "waiting",
      "cancelled",
      "stopped",
    ],
    default: "processing",
  },
  // Performance tracking (optional but useful for analytics)
  performance: {
    dailyEngagements: [
      {
        date: { type: Date, required: true, default: Date.now },
        followersGained: { type: Number, default: 0 },
        subscribersGained: { type: Number, default: 0 },
        totalViews: { type: Number, default: 0 },
        impressions: { type: Number, default: 0 }, // Number of times the ad was viewed today
        clicks: { type: Number, default: 0 }, // Number of clicks on the ad today
        conversions: { type: Number, default: 0 }, // Conversions today (e.g., purchases, sign-ups)
      },
    ],
    totalEngagements: {
      followersGained: { type: Number, default: 0 },
      subscribersGained: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 }, // Number of times the ad was viewed today
      clicks: { type: Number, default: 0 }, // Number of clicks on the ad today
      conversions: { type: Number, default: 0 }, // Conversions today (e.g., purchases, sign-ups)
    },
  },

  resourcelink: { type: String, required: true, unique: true },

  // Call to Action fields
  callToAction: {
    text: { type: String, required: true },
    link: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?/.test(v); // URL validation
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
  },
  totalCTAClicks: {
    type: Number,
    default: 0,
  },
  dailyCTAClicks: [
    {
      date: { type: Date, required: true, default: Date.now },
      count: { type: Number, default: 0 },
    },
  ],

  // Timestamps for record keeping
  created: { type: Date, default: Date.now, immutable: true, trim: true },
  updated: { type: Date, default: Date.now, trim: true, select: false },
});

// Middleware to log the creation of a new subscription order
CampaignSchema.post("save", async function (doc, next) {
  const logFile = await AutoLogFile();
  const content = `A new subscription order was created by ${doc.createdBy} on ${doc.created}\n`;
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {});
  next();
});

// Middleware to only find active subscription orders
CampaignSchema.pre(/^find/, async function (next) {
  this.find({ isActive: true });
  next();
});

// Middleware to update the 'updated' field
CampaignSchema.pre("save", function (next) {
  this.updated = Date.now();
  next();
});


CampaignSchema.pre("save", async function (next) {
  // Ensure the referral ID is only created when it doesn't exist and the document is new
  if (!this.campaignId) {
    let isUnique = false;
    while (!isUnique) {
      const randomString = crypto.randomBytes(5).toString("hex"); // Generate 10 random characters (3 bytes in hex)
      const campaignId = `${thisMonth2}CPN${randomString}`;

      // Check if this campaignId already exists in the database
      const existingUser = await this.constructor.findOne({ campaignId });

      if (!existingUser) {
        this.campaignId = campaignId; // If it's unique, assign it
        isUnique = true;
      }
    }
  }
  next();
});

export default model("campaign", CampaignSchema);
