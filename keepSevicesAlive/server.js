import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

// Enable CORS for a specific domain
app.use(cors({ origin: "https://addyapps.onrender.com" }));

// List of services to keep alive
const services = [
  "https://addyapps.onrender.com/check",
  "https://addysmart-authservice.onrender.com",
  "https://addysmart-supportservice.onrender.com",
  "https://addysmart-e-videoservice.onrender.com",
  "https://addysmart-miningservice.onrender.com",
  "https://kingdom-adele.onrender.com/check",
];

// Function to ping services using Fire-and-Forget approach
const pingServices = () => {
  services.forEach((service) => {
    axios
      .get(service)
      .then((response) => {
        console.log(`${service} is awake: ${response.status}`);
      })
      .catch((error) => {
        console.error(
          `Error pinging ${service}:`,
          error.response?.status || error.message
        );
      });
  });
};

// Start pinging services every 14 minutes and 40 seconds
const intervalId = setInterval(pingServices, (14 * 60 + 40) * 1000);
pingServices(); // Initial ping on startup

// Stop the interval after one hour (3600 seconds)
setTimeout(() => {
  clearInterval(intervalId);
  console.log("Interval stopped after one hour.");
}, 3600 * 1000);

// Basic route to confirm the service is running
app.get("/", (req, res) => {
  res.send("Keep-alive service is running...");
});

const PORT = 3600;
app.listen(PORT, () => {
  console.log(`Keep-alive service running on port ${PORT}`);
  console.log(`Client URL: http://localhost:${PORT}`);
});
