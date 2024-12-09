const encode = (datax, listArray = null, operator = null) => {
  let data = JSON.parse(JSON.stringify(datax));
  if (listArray !== null && !Array.isArray(listArray)) {
    throw new Error("The listArray parameter must be an array");
  }

  if (data == null) {
    return null; // Return null if data is empty or null
  }

  function convert(str) {
    return str
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/{/g, "&#123;")
      .replace(/}/g, "&#125;")
      .replace(/~/g, "&#126;")
      .replace(/`/g, "&#96;")
      .replace(/,/g, "&#44;")
      .replace(/\//g, "&#47;")
      .replace(/\\/g, "&#92;")
      .replace(/\(/g, "&#40;")
      .replace(/\)/g, "&#41;")
      .replace(/\[/g, "&#91;")
      .replace(/\]/g, "&#93;");
  }

  function shouldProcessField(field) {
    const effectiveOperator = operator || "-"; // Default to "-" for encode if no operator is provided
    return (
      !listArray || // Process all fields if listArray is not provided
      (effectiveOperator === "-" &&
        (!listArray || !listArray.includes(field))) ||
      (effectiveOperator === "+" && listArray && listArray.includes(field))
    );
  }

  function handleObjects(obj) {
    for (let prop in obj) {
      const type = typeof obj[prop];
      if (type === "string" && shouldProcessField(prop)) {
        obj[prop] = convert(obj[prop]);
      } else if (Array.isArray(obj[prop])) {
        obj[prop].forEach((item) => handleObjects(item));
      } else if (type === "object" && obj[prop] !== null) {
        handleObjects(obj[prop]); // Recursively handle nested objects
      }
    }
  }

  function handleSanitization(data) {
    if (typeof data === "string") {
      convert(data);
    } else if (Array.isArray(data)) {
      data.forEach((item) => handleObjects(item));
    } else if (typeof data === "object" && data !== null) {
      handleObjects(data);
    }
    return data;
  }

  return handleSanitization(data);
};

const decode = (datax, listArray = null, operator = null) => {
  let data = JSON.parse(JSON.stringify(datax));
  if (listArray !== null && !Array.isArray(listArray)) {
    throw new Error("The listArray parameter must be an array");
  }

  if (data == null) {
    return null; // Return null if data is empty or null
  }

  function revert(str) {
    return str
      .replace(/&#125;/g, "}")
      .replace(/&#123;/g, "{")
      .replace(/&#126;/g, "~")
      .replace(/&#96;/g, "`")
      .replace(/&#44;/g, ",")
      .replace(/&#47;/g, "/")
      .replace(/&#92;/g, "\\")
      .replace(/&#40;/g, "(")
      .replace(/&#41;/g, ")")
      .replace(/&#91;/g, "[")
      .replace(/&#93;/g, "]")
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }

  function shouldProcessField(field) {
    const effectiveOperator = operator || "+"; // Default to "+" for decode if no operator is provided
    return (
      !listArray || // Process all fields if listArray is not provided
      (effectiveOperator === "+" && listArray && listArray.includes(field)) ||
      (effectiveOperator === "-" && (!listArray || !listArray.includes(field)))
    );
  }

  function handleObjects(obj) {

    for (let prop in obj) {
      const propType = typeof obj[prop];
      if (propType === "string" && shouldProcessField(prop)) {
        obj[prop] = revert(obj[prop]);
      } else if (Array.isArray(obj[prop])) {
        obj[prop].forEach((item) => handleObjects(item));
      } else if (propType === "object" && obj[prop] !== null) {
        handleObjects(obj[prop]); // Recursively handle nested objects
      }
    }
  }

  function handleReversion(data) {
    if (typeof data === "string") {
      revert(data);
    } else if (Array.isArray(data)) {
      data.forEach((item) => handleObjects(item));
    } else if (typeof data === "object" && data !== null) {
      handleObjects(data);
    }
    return data;
  }

  return handleReversion(data);
};

export default { encode, decode };
