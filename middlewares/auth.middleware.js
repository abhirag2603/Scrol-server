import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    // Extract token from cookies or Authorization header
    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
    console.log("Token:", token); // Log token for debugging
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized request: No token provided" });
    }

    // Verify the token
    const decodedToken = await jwt.verify(token, process.env.TOKEN_SECRET);

    const id = decodedToken?.id;
    if (!id) {
      return res.status(401).json({ error: "Invalid token structure" });
    }

    // Find the user by the ID encoded in the token
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "Invalid Access Token: User not found" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
