// import jwt from "jsonwebtoken";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    // Safely get token from cookies or Bearer header
    let token = null;

    // Check cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // Check Authorization header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY);

    req.id = decode.id; // attach user id
    next();
  } catch (error) {
    console.log("Auth Middleware Error:", error);
    return res.status(401).json({
      message: "User not authenticated",
      success: false,
    });
  }
};

export default isAuthenticated;
