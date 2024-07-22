import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

export const verifyJWT = async(req,res,next)=>{
try {
    const vtoken= req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "")

    if(!vtoken){
        throw new Error("Unauthorized request")
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-password")

    if (!user) {
        throw new Error("Invalid Access Token")
    }
    req.user = user;
    next()

} catch (error) {
    res.status(500).json({error: error.message})
}
}