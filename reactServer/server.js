import express from "express";
import axios from "axios";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url"; // Required to handle import.meta.url
// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: "./config.env" });

const app = express();
// app.set("trust proxy", true);
let lastPingedKeepAlive = 0; // Initialize timestamp

app.use(express.static(path.join(__dirname, "dist"))); // Adjust to your Vite output folder


const services = [
process.env.KEEP_ALIVE,

process.env.ALIVE_AUTH1,

process.env.ALIVE_SUPPORT1,

process.env.ALIVE_E_VIDEOS1,

process.env.ALIVE_MINING1,
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
pingServices();



const pingService = async () => {
  const service = process.env.KEEP_ALIVE;
  try {
    const response = await axios.get(service);
    console.log(`${service} is awake: ${response.status}`);
    lastPingedKeepAlive = Date.now(); // Update timestamp on successful ping
  } catch (error) {
    console.error(`Error pinging ${service}:`, error.message);
  }
};


// Health check endpoint
app.get("/check", async (req, res) => {
  // await pingServices();
  pingService();
  res.send("Service is running...");
});

app.get("*", (req, res) => {
  if (Date.now() - lastPingedKeepAlive > 15 * 60 * 1000) {
    console.log("Pinging services as last ping was more than 15 minutes ago.");
    pingServices(); // Trigger the ping in the background
  }
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

const PORT = 3500;
app.listen(PORT, () => {
    console.log(`React node server running on port ${PORT}`);
    console.log(`Client URL: http://localhost:${PORT}`);
});
