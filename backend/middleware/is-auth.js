const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // get token from headers

    const authHeader = req.get("Authorization");
    if (!authHeader) {
      const error = new Error("Not authenticated");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1]; // Bearer token

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, "somesupersecretsecret");
    } catch (err) {
      return res.status(500).json({ message: "Token verification failed" });
    }

    if (!decodedToken) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    req.userId = decodedToken.userId; // attach user data for next middleware
    next();
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
