import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error("Unauthorized request");
    }

    const decodedToken =await jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("Decoded Token:", decodedToken);

    const id = decodedToken?.id;
    if (!id) {
      throw new Error("Invalid token structure");
    }

    const user = await User.findById(id).select("-password");
    console.log("User found:", user);

    if (!user) {
      throw new Error("Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
