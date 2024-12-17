import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import dynamicRateLimiter from "./Utils/RateLimiter.js";
import path from "path";
import bodyParser from "body-parser";
import { s2sProtect } from "./Controllers/authcontroller.js";
import { fileURLToPath } from "url"; // Required to handle import.meta.url

const app = express();
app.use(express.json()); // For parsing application/json
app.use(cookieParser()); // For parsing cookies
app.use(helmet()); // Use helmet to secure HTTP headers
// app.set("trust proxy", true);

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//// RATE LIMITER EXAMPLE
app.use("/api/a", dynamicRateLimiter(10)); // 10 attempts per minute
app.use("/api/b", dynamicRateLimiter(15)); // 15 attempts per minute
app.use("/api/c", dynamicRateLimiter(20)); // 20 attempts per minute
app.use("/api/d", dynamicRateLimiter(25)); // 25 attempts per minute
app.use("/api/e", dynamicRateLimiter(30)); // 30 attempts per minute
app.use("/api/s", s2sProtect); // Server-to-server connection protection

import ejs from "ejs";
app.set("view engine", "ejs");
// Use the cookie-parser middleware

import cors from "cors";
// app.use(
//   cors({
//     origin: true, // Reflect the origin of the request
//     credentials: true, // Allow cookies and credentials
//   })
// );

// const allowedOrigins = [
//   "http://client-domain.com", // HTTP version for development
//   "https://client-domain.com", // HTTPS version for production
//   "http://another-client.com",
//   "https://another-client.com",
// ];

// Dynamically setting the allowed origins based on the environment
// const allowedOrigins =
//   process.env.NODE_ENV === "production"
//     ? [
//         `https://${process.env.AUTH_HOST}`,
//         `https://${process.env.SUPPORT_HOST}`,
//         `https://${process.env.E_VIDEO_HOST}`,
//         `https://${process.env.MINING_HOST}`,
//         `https://${process.env.AFFILIATE_HOST}`,
//         `https://${process.env.MESSAGING_HOST}`,
//         `https://${process.env.ADVERTIZING_HOST}`,
//         `https://${process.env.SPONSORSHIP_HOST}`,
//         `https://${process.env.PAYMENT_HOST}`,
//         `https://${process.env.CAMPAIGN_HOST}`,
//         `https://${process.env.CLIENT_HOST}`,
//         `https://${process.env.CLIENT_HOSTX}`,
//         `https://${process.env.CLIENT_HOST2}`,
//         `https://addysmart-keepalive.onrender.com`,
//       ]
//     : [
//         `http://${process.env.DEV_AUTH_HOST}`,
//         `http://${process.env.DEV_SUPPORT_HOST}`,
//         `http://${process.env.DEV_E_VIDEO_HOST}`,
//         `http://${process.env.DEV_MINING_HOST}`,
//         `http://${process.env.DEV_AFFILIATE_HOST}`,
//         `http://${process.env.DEV_MESSAGING_HOST}`,
//         `http://${process.env.DEV_ADVERTIZING_HOST}`,
//         `http://${process.env.DEV_SPONSORSHIP_HOST}`,
//         `http://${process.env.DEV_PAYMENT_HOST}`,
//         `http://${process.env.DEV_CAMPAIGN_HOST}`,
//         `http://${process.env.DEV_CLIENT_HOST}`,
//       ];


const SeverHostNames = [
  "AUTH_HOST",
  "SUPPORT_HOST",
  "E_VIDEO_HOST",
  "MINING_HOST",
  "AFFILIATE_HOST",
  "MESSAGING_HOST",
  "ADVERTIZING_HOST",
  "SPONSORSHIP_HOST",
  "PAYMENT_HOST",
  "CAMPAIGN_HOST",
];

const clientHostNames = ["CLIENT_HOSTX"];

let allowedOrigins = [];

if (process.env.NODE_ENV === "production") {
  const suffixes = process.env.PROD_TEST === "true" ? [""] : ["1", "2", "3"];

  // Add production server hosts
  allowedOrigins = SeverHostNames.flatMap((host) =>
    suffixes.map((suffix) => `https://${process.env[host]}${suffix}`)
  );

  // Add client hosts with multiple suffixes
  const suffixes2 =
    process.env.PROD_TEST === "true" ? [""] : ["1", "2", "3", "4", "5", "6"];

  clientHostNames.forEach((host) => {
    suffixes2.forEach((suffix) => {
      allowedOrigins.push(`https://${process.env[host]}${suffix}`);
    });
  });

  // Additional origins
  allowedOrigins.push(`https://${process.env.CLIENT_HOST}`);
  allowedOrigins.push(`https://${process.env.CLIENT_HOST2}`);
  allowedOrigins.push("https://addysmart-keepalive.onrender.com");
} else {
  // Use SeverHostNames instead of undefined hostNames
  allowedOrigins = SeverHostNames.map(
    (host) => `http://${process.env[`DEV_${host}`]}`
  );
}




// CORS middleware setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow this origin
      } else {
        console.log("origin", origin);
        callback(new Error("Not allowed by CORS")); // Reject the request
      }
    },
    credentials: true, // Allow cookies to be sent
  })
);

// Import routers
import authRouter from "./Routes/authrouter.js";
import referralRouter from "./Routes/referralRoutes.js";
import referralTaskRouter from "./Routes/referralTaskRoutes.js";

// Middleware to log requests and set request timestamp
const logger = function (req, res, next) {
  next();
};

const requestedAt = function (req, res, next) {
  req.requestedAt = new Date().toISOString();
  next();
};

app.use(express.static("./public"));
app.use(requestedAt);

// Mount routers
app.use("/api/a/v1.00/users", authRouter); // User/auth route
app.use("/api/a/v1.00/referraltask", referralTaskRouter); // Referral route
app.use("/api/s/v1.00/referraltask", referralTaskRouter); // Referral route
app.use("/api/a/v1.00/referral", referralRouter); // Referral route
app.use("/api/s/v1.00/referral", referralRouter); // Referral route
app.use("/api/s/v1.00/users", authRouter); // User/auth route

// Static file serving
app.use(express.static(path.join(__dirname, "dist"))); // Serve static files from the "dist" directory (React build files).
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Access static files in the upload folder

// // Serve the main index.html file
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
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
