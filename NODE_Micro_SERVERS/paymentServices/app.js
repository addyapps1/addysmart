import express from "express";
import dynamicRateLimiter from "./Utils/RateLimiter.js";
import path from "path";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { s2sProtect } from "./Controllers/authcontroller.js";

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



// RATE LIMITE CLASSES
// Apply rate limiter middleware
// use path in api
app.use("/api/a", dynamicRateLimiter(10)); // 10 attempts per minute
app.use("/api/b", dynamicRateLimiter(15)); // 15 attempts per minute
app.use("/api/c", dynamicRateLimiter(20)); // 20 attempts per minute
app.use("/api/d", dynamicRateLimiter(25)); // 25 attempts per minute
app.use("/api/e", dynamicRateLimiter(30)); // 30 attempts per minute
app.use("/api/s", s2sProtect); // Server-to-server connection protection


import ejs from "ejs";
app.set("view engine", "ejs");

import cors from "cors";
// app.use(cors());
// Dynamically setting the allowed origins based on the environment
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
        callback(new Error("Not allowed by CORS")); // Reject the request
      }
    },
    credentials: true, // Allow cookies to be sent
  })
);


// Require routers
import transactionRouter from "./Routes/transactionroutes.js";
import userAccountDetailsRouter from "./Routes/userAccountDetailsroutes.js";



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
app.use("/api/a/v1.00/transaction", transactionRouter); // Mounting transaction route

app.use("/api/a/v1.00/useraccountdetails", userAccountDetailsRouter); // Mounting userAccountDetails route

app.use("/api/s/v1.00/transaction", transactionRouter); // Mounting transaction route

app.use("/api/s/v1.00/useraccountdetails", userAccountDetailsRouter); // Mounting userAccountDetails route

app.use(express.static(path.join(import.meta.url, "build"))); // Serve static files from the "public" directory (React build files).
app.use("/uploads", express.static(path.join(import.meta.url, "uploads"))); // Lets us access static files in the upload folder

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

