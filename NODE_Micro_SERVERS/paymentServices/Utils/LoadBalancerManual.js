// Define server groups with how many servers each group has (not the actual servers)
const serverGroups = {
  AUTH_HOST: 1,
  SUPPORT_HOST: 1,
  E_VIDEO_HOST: 1,
  MINING_HOST: 1,
  AFFILIATE_HOST: 1,
  MESSAGING_HOST: 1,
  ADVERTIZING_HOST: 1,
  SPONSORSHIP_HOST: 1,
  PAYMENT_HOST: 1,
  CAMPAIGN_HOST: 1,
};

// Track the last used suffix for each server group
const serverTracker = {};


const getNextServerIndex = (groupName) => {
  if (!serverGroups[groupName]) {
    throw new Error(`Server group ${groupName} does not exist.`);
  }

  // Initialize the suffix tracker if it doesn't exist
  if (!serverTracker[groupName]) {
    serverTracker[groupName] = 0;
  }

  // Get the number of servers for the group
  const numServers = serverGroups[groupName];

  // Calculate the next server index and increment the tracker
  const nextIndex = serverTracker[groupName] % numServers;
  serverTracker[groupName]++;

  return nextIndex + 1; // Return 1-based index (e.g., 1, 2, 3)
}


export default getNextServerIndex;

// // Example usage:
// console.log("Distributing load to AUTH_HOST:", getNextServerIndex("AUTH_HOST"));
// console.log(
//   "Distributing load to SUPPORT_HOST:",
//   getNextServerIndex("SUPPORT_HOST")
// );
// console.log(
//   "Distributing load to E_VIDEO_HOST:",
//   getNextServerIndex("E_VIDEO_HOST")
// );
// console.log(
//   "Distributing load to CLIENT_HOSTX:",
//   getNextServerIndex("CLIENT_HOSTX")
// );
// console.log(
//   "Distributing load to PAYMENT_HOST:",
//   getNextServerIndex("PAYMENT_HOST")
// );
