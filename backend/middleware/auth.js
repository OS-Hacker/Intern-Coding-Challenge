const JWT = require("jsonwebtoken");

const authUser = async (req, res, next) => {
  try {
    // Check if authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).send({ msg: "Unauthorized - No token provided" });
    }

    const token = req.headers.authorization.split(" ")[1]; // ["Bearer", "token"]

    // Check if token is provided
    if (!token) {
      return res
        .status(401)
        .send({ msg: "Unauthorized - Invalid token format" });
    }

    // Verify token
    const decode = await JWT.verify(token, process.env.JWT_SECRET);
    req.user = decode;

    // if all ok then go to next route
    next();
  } catch (error) {
    console.log("Vefication failed", error);
    res.status(401).send({
      success: false,
      msg: "Unauthorized - Token verification failed",
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req?.user?.user?.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(402).send({
      success: false,
      msg: "Error in Admin",
    });
  }
};

module.exports = {
  authUser,
  isAdmin,
};
