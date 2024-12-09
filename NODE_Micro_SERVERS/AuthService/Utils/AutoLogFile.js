import fs from "fs";

const createLogFile = async (folder = "log") => {
  const DATE = new Date();
  const YY = DATE.getFullYear();
  const mm = DATE.toLocaleString("default", { month: "short" }); // Get abbreviated month (e.g., Jan, Feb)
  const dd = String(DATE.getDate()).padStart(2, "0"); // Pad single digit day with a leading zero

  const logFile = `./Log/${folder}_${dd}_${mm}_${YY}.txt`;
  const dir = "./Log";

  // Ensure directory exists, create it if it doesn't
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.error(`Error creating directory ${dir}:`, err);
    throw err;
  }

  return logFile;
};

export default createLogFile;
