import RateLimit from 'express-rate-limit';

// Function to calculate the rate limit dynamically based on some variables
const calculateRateLimit = (limit) => {
    // Your logic to calculate the rate limit dynamically
    const dynamicLimit = limit; // Example: calculated dynamically
    return dynamicLimit;
};

// Create a rate limiter middleware with dynamic limit
const dynamicRateLimiter = (limit) => {
    return RateLimit({
        windowMs: 60 * 1000, // 1 minute window
        max: calculateRateLimit(limit), // dynamically calculated limit
        message: "Too many requests from this IP, please try again later",
        headers: true, // send custom rate limit header
    });
};

export default dynamicRateLimiter;
