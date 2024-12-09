const updateResponseFilePathsWithHostName = (data, host) => {
  const dataTypeOf = typeof data;
  const isArray = Array.isArray(data);
  const keysToMatch = ["files", "file", "profileImg"];

  function handleArrayOfObjects() {
    for (let j = 0; j < data.length; j++) {
      // Iterate through the entire array
      for (let key in data[j]) {
        if (keysToMatch.includes(key)) {
          // Check the key, not the value
          if (Array.isArray(data[j][key])) {
            for (let i = 0; i < data[j][key].length; i++) {
              if (data[j][key][i]?.filePath) {
                // Check if filePath exists
                data[j][key][
                  i
                ].filePath = `${host}/${data[j][key][i].filePath}`;
              }
            }
          } else if (data[j][key]?.filePath) {
            data[j][key].filePath = `${host}/${data[j][key].filePath}`;
          }
        }
      }
    }
    return data;
  }

  function handleObject() {
    for (let key in data) {
      if (keysToMatch.includes(key)) {
        if (Array.isArray(data[key])) {
          for (let i = 0; i < data[key].length; i++) {
            if (data[key][i]?.filePath) {
              data[key][i].filePath = `${host}/${data[key][i].filePath}`;
            }
          }
        } else if (data[key]?.filePath) {
          data[key].filePath = `${host}/${data[key].filePath}`;
        }
      }
    }
    return data;
  }

  function handlePrependHost() {
    if (isArray) {
      return handleArrayOfObjects();
    } else if (dataTypeOf === "object") {
      return handleObject();
    }
    return data;
  }

  return handlePrependHost();
};

export default updateResponseFilePathsWithHostName;
