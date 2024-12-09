const updateResponseFilePathsWithHostName = (data, host) => {
  const keysToMatch = ["files", "file", "profileImg", "filePath", "path"];
  const visited = new Set(); // Track visited objects to avoid infinite recursion

  function updateFilePath(item) {
    if (typeof item === "object" && item !== null && !visited.has(item)) {
      visited.add(item); // Mark the item as visited

      if (Array.isArray(item)) {
        item.forEach((subItem) => updateFilePath(subItem));
      } else {
        for (const key in item) {
          if (keysToMatch.includes(key.toLowerCase())) {
            if (typeof item[key] === "string") {
              // Prepend host if it’s a string path
              item[key] = `${host}/${item[key]}`;
            } else if (Array.isArray(item[key])) {
              // Recursively update each element in the array
              item[key].forEach((subItem) => updateFilePath(subItem));
            } else if (typeof item[key] === "object" && item[key] !== null) {
              // Recursively update the nested object
              updateFilePath(item[key]);
            }
          } else if (typeof item[key] === "object" && item[key] !== null) {
            // Recursively update non-matching keys
            updateFilePath(item[key]);
          }
        }
      }
    }
  }

  // Start the update process
  updateFilePath(data);
  return data;
};

export default updateResponseFilePathsWithHostName;
