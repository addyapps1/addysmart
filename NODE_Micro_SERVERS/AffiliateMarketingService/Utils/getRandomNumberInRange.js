
const getRandomNumberInRange = (start, finish) => {
  // Ensure the range is valid
  if (start > finish) {
    throw new Error("Start must be less than or equal to finish");
  }

  // Generate the random number
  const randomNumber = Math.random() * (finish - start) + start;

  // Return as an integer if needed
  return Math.floor(randomNumber); // Change to Math.round() or Math.ceil() if necessary
}

export default getRandomNumberInRange;

// Example usage
// console.log(getRandomNumberInRange(10, 50));
// Outputs a random number between 10 and 50
