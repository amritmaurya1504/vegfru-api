const { client } = require("../redis/redisClient");

/**
 * Rate limiting middleware
 * @param {number} secondWindow - Time window in seconds for rate limiting
 * @param {number} allowedHits - Maximum number of allowed hits within the time window
 * @returns {Function} - Express middleware function
 */
function rateLimiter(secondWindow, allowedHits) {
  return async (req, res, next) => {
    let IP_ADDRESS;
    try {
      // Retrieve the client's IP address from the request headers
      IP_ADDRESS = req.headers['x-forwarded-for'] || req.connection.remoteAddress

      // Increment the count for the IP address in Redis
      const request = await client.incr(IP_ADDRESS);
      let ttl;

      if (request === 1) {
        // If it's the first request within the time window, set the expiration time
        await client.expire(IP_ADDRESS, secondWindow);
        ttl = secondWindow;
      } else {
        // If it's not the first request, get the remaining time to live (TTL) for the key
        ttl = await client.ttl(IP_ADDRESS);
      }

      // Check if the number of requests exceeds the allowedHits limit
      if (request > allowedHits) {
        // If exceeded, return a 503 status with error message and rate limiting details
        return res.status(503).json({
          response: "error",
          callsInMinute: request,
          ttl,
        });
      } else {
        // If within the limit, proceed to the next middleware/route handler
        next();
      }
    } catch (error) {
      // Log the error and relevant information for debugging
      console.error("Redis Error:", error);
      console.error("Arguments:", IP_ADDRESS); // Log relevant arguments or data
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

module.exports = rateLimiter;
