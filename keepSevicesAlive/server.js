import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "https://addyapps1.onrender.com/check",
  "https://addyapps2.onrender.com/check",
  "https://addyapps3.onrender.com/check",
  "https://addyapps4.onrender.com/check",
  "https://addyapps5.onrender.com/check",
  "https://addyapps6.onrender.com/check",
];
// app.use(cors({ origin: "https://addyapps.onrender.com" }));

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

// List of services to keep alive
const services = [
  process.env.ALIVE_AUTH1,

  process.env.ALIVE_SUPPORT1,

  process.env.ALIVE_E_VIDEOS1,

  process.env.ALIVE_MINING1,
];

// List of client services to monitor
const clientServices = [
  process.env.ALIVE_CL1,
  process.env.ALIVE_CL2,
  process.env.ALIVE_CL3,
  process.env.ALIVE_CL4,
  process.env.ALIVE_CL5,
  process.env.ALIVE_CL6,
];

// Function to ping services
const pingServices = async (servicesList) => {
  try {
    const results = await Promise.allSettled(
      servicesList.map((service) => axios.get(service))
    );
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(`${servicesList[index]} is awake: ${result.value.status}`);
      } else {
        console.error(
          `Failed to reach ${servicesList[index]}: ${
            result.reason.message || result.reason
          }`
        );
      }
    });
  } catch (error) {
    console.error("Error pinging services:", error.message);
  }
};

// Function to ensure at least one ClientService is awake
const pingClientServices = async () => {
  try {
    const results = await Promise.allSettled(
      clientServices.map((service) => axios.get(service))
    );

    const awakeServices = results.filter((res) => res.status === "fulfilled");

    if (awakeServices.length > 0) {
      awakeServices.forEach(({ value }) => {
        console.log(`${value.config.url} is awake: ${value.status}`);
      });
    } else {
      console.error("ALERT: No client services are awake!");
    }
  } catch (error) {
    console.error("Error checking client services:", error.message);
  }
};

// Combined ping function
const ping = async () => {
  console.log("Starting ping cycle...");
  await Promise.all([pingServices(services), pingClientServices()]);
};

ping(); // Initial ping on startup


const ifDueToPing = async () => {
  const currentDay = new Date().getDate();
  const lowerRange = parseInt(process.env.KEEPALIVE_LOWER_RANGE);
  const upperRange = parseInt(process.env.KEEPALIVE_UPPER_RANGE);

  // Validate environment variables
  if (isNaN(lowerRange) || isNaN(upperRange)) {
    console.error(
      "KEEPALIVE_LOWER_RANGE and KEEPALIVE_UPPER_RANGE must be valid numbers."
    );
    return;
  }

  // Check if the current day is within the range
  if (currentDay >= lowerRange && currentDay <= upperRange) {
    try {
      await ping(); // Call the ping function asynchronously
    } catch (error) {
      console.error("Error executing ping:", error.message);
    }
  } else {
    console.log(
      `Current day ${currentDay} is outside the range (${lowerRange}-${upperRange}).`
    );
    clearInterval(intervalId);
  }
};


// Start pinging every 14 minutes and 40 seconds
const intervalId = setInterval(ifDueToPing, (14 * 60 + 40) * 1000);

// Stop the interval after 4 hours
setTimeout(() => {
  clearInterval(intervalId);
  console.log("Pinging stopped after 3 hours.");
}, 3 * 3600 * 1000);

// Basic route to confirm the service is running
app.get("/", (req, res) => {
  res.send("Keep-alive service is running...");
});

const PORT = 3600;
app.listen(PORT, () => {
  console.log(`Keep-alive service running on port ${PORT}`);
  console.log(`Client URL: http://localhost:${PORT}`);
});
