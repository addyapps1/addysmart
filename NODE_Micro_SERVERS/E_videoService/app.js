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

// Use express built-in JSON parser instead of bodyParser
app.use(express.json());
// Use Helmet for security
app.use(helmet());

// Use cookie-parser to handle cookies
app.use(cookieParser());
// app.set("trust proxy", true);


// Apply rate limiter middleware to specific routes
app.use("/api/a", dynamicRateLimiter(20)); // 10 attempts per minute
app.use("/api/b", dynamicRateLimiter(15)); // 15 attempts per minute
app.use("/api/c", dynamicRateLimiter(20)); // 20 attempts per minute
app.use("/api/d", dynamicRateLimiter(25)); // 25 attempts per minute
app.use("/api/e", dynamicRateLimiter(30)); // 30 attempts per minute
app.use("/api/s", s2sProtect); // Server-to-server connection protection

// Set EJS as the view engine
import ejs from "ejs";
app.set("view engine", "ejs");

// Enable CORS
import cors from "cors";
// app.use(cors());
// Dynamically setting the allowed origins based on the environment
const ServerHostNames = [
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

  // // Add production server hosts
  // allowedOrigins = SeverHostNames.flatMap((host) =>
  //   suffixes.map((suffix) => `https://${process.env[host]}${suffix}`)
  // );


  // Add production server hosts
  allowedOrigins = ServerHostNames.flatMap((host) => {
    const [firstPart, secondPart] = process.env[host].split(/\.(.+)/);
    return suffixes.map((suffix) => {
      // console.log(`https://${firstPart}${suffix}.${secondPart}`);
      return `https://${firstPart}${suffix}.${secondPart}`;
    });
  });

  // Add client hosts with multiple suffixes
  const suffixes2 =
    process.env.PROD_TEST === "true" ? [""] : ["1", "2", "3", "4", "5", "6"];

  clientHostNames.forEach((host) => {
    const [firstPart, secondPart] = process.env[host].split(/\.(.+)/);
    suffixes2.forEach((suffix) => {
      // console.log(`https://${firstPart}${suffix}.${secondPart}`);
      allowedOrigins.push(`https://${firstPart}${suffix}.${secondPart}`);
    });
  });

  // Additional origins
  allowedOrigins.push(`https://${process.env.CLIENT_HOST}`);
  allowedOrigins.push(`https://${process.env.CLIENT_HOST2}`);
  allowedOrigins.push("https://addysmart-keepalive.onrender.com");
} else {
  // Use SeverHostNames instead of undefined hostNames
  console.log("local servers");
  allowedOrigins = ServerHostNames.map(
    (host) => `http://${process.env[`DEV_${host}`]}`
  );

  allowedOrigins.push(`http://${process.env.DEV_CLIENT_HOST}`);
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

console.log("allowedOrigins", allowedOrigins);


// Import routers
import externalContentRouter from "./Routes/externalcontentsroutes.js";

// Logger and requestedAt middleware
const logger = function (req, res, next) {
  next();
};

const requestedAt = function (req, res, next) {
  req.requestedAt = new Date().toISOString();
  next();
};

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(requestedAt);

// Using routes
app.use("/api/a/v1.00/evideo", externalContentRouter); // Mount externalContent route
app.use("/api/s/v1.00/evideo", externalContentRouter); // Mount externalContent route

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, "build")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Access static files in the uploads folder

// // Catch-all route for serving React app
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
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

// Export the app
export default app;
