import express from "express";
import dynamicRateLimiter from "./Utils/RateLimiter.js";
import path from "path";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { s2sProtect } from "./Controllers/authcontroller.js";

import ejs from "ejs";
import cors from "cors";
import balanceRouter from "./Routes/balanceroutes.js";
import coinMiningRouter from "./Routes/coinminingroutes.js";
import coinSatementRouter from "./Routes/coinstatementroutes.js";
import referralBonusesRouter from "./Routes/referralbonusesroutes.js";
import checkinroutes from "./Routes/checkinroutes.js";

import { fileURLToPath } from "url"; // Required to handle import.meta.url

const app = express();

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
// Use Helmet for security
app.use(helmet());

// Use cookie-parser to handle cookies
app.use(cookieParser());
// app.set("trust proxy", true);

// app.use(cors());
// Dynamically setting the allowed origins based on the environment
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        `https://${process.env.AUTH_HOST}`,
        `https://${process.env.SUPPORT_HOST}`,
        `https://${process.env.E_VIDEO_HOST}`,
        `https://${process.env.MINING_HOST}`,
        `https://${process.env.AFFILIATE_HOST}`,
        `https://${process.env.MESSAGING_HOST}`,
        `https://${process.env.ADVERTIZING_HOST}`,
        `https://${process.env.SPONSORSHIP_HOST}`,
        `https://${process.env.PAYMENT_HOST}`,
        `https://${process.env.CAMPAIGN_HOST}`,
        `https://${process.env.CLIENT_HOST}`,
        `https://${process.env.CLIENT_HOSTX}`,
        `https://${process.env.CLIENT_HOST2}`,
        `https://addysmart-keepalive.onrender.com`,
      ]
    : [
        `http://${process.env.DEV_AUTH_HOST}`,
        `http://${process.env.DEV_SUPPORT_HOST}`,
        `http://${process.env.DEV_E_VIDEO_HOST}`,
        `http://${process.env.DEV_MINING_HOST}`,
        `http://${process.env.DEV_AFFILIATE_HOST}`,
        `http://${process.env.DEV_MESSAGING_HOST}`,
        `http://${process.env.DEV_ADVERTIZING_HOST}`,
        `http://${process.env.DEV_SPONSORSHIP_HOST}`,
        `http://${process.env.DEV_PAYMENT_HOST}`,
        `http://${process.env.DEV_CAMPAIGN_HOST}`,
        `http://${process.env.DEV_CLIENT_HOST}`,
      ];


// CORS middleware setup
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("origin", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow this origin
      } else {
        callback(new Error("Not allowed by CORS")); // Reject the request
      }
    },
    credentials: true, // Allow cookies to be sent
  })
);


app.use("/api/a", dynamicRateLimiter(20)); // 20 attempts per minute
app.use("/api/b", dynamicRateLimiter(25)); // 25 attempts per minute
app.use("/api/c", dynamicRateLimiter(30)); // 30 attempts per minute
app.use("/api/d", dynamicRateLimiter(35)); // 35 attempts per minute
app.use("/api/e", dynamicRateLimiter(40)); // 40 attempts per minute
app.use("/api/s", s2sProtect); // Server-to-server connection protection

app.set("view engine", "ejs");

const requestedAt = (req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
};

app.use(express.static(new URL("./public", import.meta.url).pathname));
app.use(requestedAt);

app.use("/api/a/v1.00/balance", balanceRouter);
app.use("/api/a/v1.00/coinmining", coinMiningRouter);
app.use("/api/a/v1.00/coinsatement", coinSatementRouter);
app.use("/api/a/v1.00/referralBonus", referralBonusesRouter);
app.use("/api/a/v1.00/checkin", checkinroutes);

app.use("/api/s/v1.00/balance", balanceRouter);
app.use("/api/s/v1.00/coinmining", coinMiningRouter);
app.use("/api/s/v1.00/coinsatement", coinSatementRouter);
app.use("/api/s/v1.00/referralBonus", referralBonusesRouter);
app.use("/api/s/v1.00/checkin", checkinroutes);

app.use(express.static(new URL("./build", import.meta.url).pathname));
app.use(
  "/uploads",
  express.static(new URL("./uploads", import.meta.url).pathname)
);

app.get("/", (req, res) => {
  res.send("service is running...");
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "An unexpected error occurred",
  });
});


export default app;
