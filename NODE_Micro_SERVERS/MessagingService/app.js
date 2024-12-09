import express from "express";
import dynamicRateLimiter from "./Utils/RateLimiter.js";
import path from "path";
import helmet from "helmet";
import cookieParser from "cookie-parser";


import { fileURLToPath } from "url"; // Required to handle import.meta.url

const app = express();

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.use(bodyParser.json());
app.use(express.json());
// Use Helmet for security
app.use(helmet());

// Use cookie-parser to handle cookies
app.use(cookieParser());
app.set("trust proxy", true);


//// DEMO start
// // Apply the dynamic rate limiter middleware to specific routes or all routes
// app.use('/api/', dynamicRateLimiter(6)); // Apply to all routes under /api/ with a limit of 6
// // or
// // Apply rate limiter middleware to specific routes with different limits
// app.use('/api/limited1', dynamicRateLimiter(10)); // Apply rate limiting with limit of 10 requests per minute for API1
// app.use('/api/limited2', dynamicRateLimiter(20)); // Apply rate limiting with limit of 20 requests per minute for API2
// app.use('/api/unlimited', dynamicRateLimiter(null)); // Exclude rate limiting for API3

// // Define your routes
// app.get('/api/limited1/resource', (req, res) => {
//     res.send('API1 Resource');
// });

// app.get('/api/limited2/resource', (req, res) => {
//     res.send('API2 Resource');
// });

// app.get('/api/unlimited/resource', (req, res) => {
//     res.send('API3 Resource');
// });
//// DEMO start

// RATE LIMITE CLASSES
// Apply rate limiter middleware
// use path in api
app.use("/api/a", dynamicRateLimiter(10)); // 10 attempts per minute
app.use("/api/b", dynamicRateLimiter(15)); // 15 attempts per minute
app.use("/api/c", dynamicRateLimiter(20)); // 20 attempts per minute
app.use("/api/d", dynamicRateLimiter(25)); // 25 attempts per minute
app.use("/api/e", dynamicRateLimiter(30)); // 30 attempts per minute

import ejs from "ejs";
app.set("view engine", "ejs");

import cors from "cors";
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
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow this origin
      } else {
        callback(new Error("Not allowed by CORS")); // Reject the request
      }
    },
    credentials: true, // Allow cookies to be sent
  })
);


// Require routers
import authRouter from "./Routes/authrouter.js";
import affiliateProductsRouter from "./Routes/affiliateproductsroutes.js";
import balanceRouter from "./Routes/balanceroutes.js";
import coinMiningRouter from "./Routes/coinminingroutes.js";
import coinSatementRouter from "./Routes/coinstatementroutes.js";
import externalContentRouter from "./Routes/externalcontentsroutes.js";
import referralBonusesRouter from "./Routes/referralbonusesroutes.js";
import referralRouter from "./Routes/referralRoutes.js";
import resourcematerialRouter from "./Routes/resourcematerialsroutes.js";
import checkinroutes from "./Routes/checkinroutes.js";
// import checkinroutes from "./Routes/checkinroutes.js";

const logger = function (req, res, next) {
  next();
};

const requestedAt = function (req, res, next) {
  req.requestedAt = new Date().toISOString();
  next();
};

app.use(express.static("./public"));
app.use(requestedAt);

// USING THE ROUTES
app.use("/api/a/v1.00/users", authRouter); // Mounting user/auth route
app.use("/api/a/v1.00/balance", balanceRouter); // Mounting balance route
app.use("/api/a/v1.00/affiliates", affiliateProductsRouter); // Mounting affiliateProducts route
app.use("/api/a/v1.00/coinmining", coinMiningRouter); // Mounting coinmining route
app.use("/api/a/v1.00/coinsatement", coinSatementRouter); // Mounting coinsatement route
app.use("/api/a/v1.00/evideo", externalContentRouter); // Mounting externalContent route
app.use("/api/a/v1.00/referralBonus", referralBonusesRouter); // Mounting referralBonuses route
app.use("/api/a/v1.00/referral", referralRouter); // Mounting referral route
app.use("/api/a/v1.00/resourcematerial", resourcematerialRouter); // Mounting resourcematerial route
app.use("/api/a/v1.00/checkin", checkinroutes); // Mounting checkin route
// app.use("/api/a/v1.00/checkin", checkinroutes); // Mounting checkin route


app.use(express.static(path.join(import.meta.url, "build"))); // Serve static files from the "public" directory (React build files).
app.use("/uploads", express.static(path.join(import.meta.url, "uploads"))); // Lets us access static files in the upload folder

// app.get("/*", (req, res) => {
//   res.sendFile(path.join(import.meta.url, "build", "index.html"));
// });

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

