// Utils/performanceDataLogger.js
import createLogFile from "./AutoLogFile.js"; // Ensure to import your AutoLogFile utility
import fs from "fs";

const PerformanceDataLogger = async (label, duration) => {
  const logFile = await createLogFile("performance"); // Specify the folder for performance logs

  // Convert duration to milliseconds
  const milliseconds = duration[0] * 1000 + duration[1] / 1e6; // seconds to milliseconds + nanoseconds to milliseconds
  const content = `Performance Log - ${label}: ${milliseconds} ms, Timestamp: ${new Date().toISOString()}\n`;

  // Append the log to the specified log file
  fs.writeFileSync(logFile, content, { flag: "a" }, (err) => {
    if (err) {
      // Optional error handling if needed
      console.error(`Error writing to log file: ${err}`);
    }
  });
};

export default PerformanceDataLogger;
