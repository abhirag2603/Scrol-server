import User from '../models/user.model.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
const saltRound=10;

export const register = async (req, res) => {
  try {
    const { username, firstName, lastName, email, password } = req.body;

    const existedUser = await User.findOne({ email });

    if (existedUser) {
      throw new Error("User already exists");
    }
     
    const passwordHash = await bcrypt.hash(password, saltRound);

    const newUser = new User({
      username,
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: 'None',
    });

    res.status(201).json({ user: savedUser, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const{email,password}= req.body;
  console.log('Request Body:', req.body);
   console.log('Email:', email);
   console.log('Password:', password);
   try{
    const user = await User.findOne({email});
    
    if (!user) {
      return res.status(400).json({ error: "user does not exists" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign( 
      { id: user._id },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    console.log(token)
    res.cookie("token", token, {
      httpOnly: true, // 'None' if cross-site
      maxAge: 3600000,
      sameSite: 'None',
    });
    

    const { password: pwd, ...userWithoutPassword } = user.toObject();

    res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async(req, res)=>{
  const options = {
    httpOnly: true,
    sameSite: 'None',
}

 return res
 .status(200)
 .clearCookie("token", options)
 .json({message: "User logged out"})
}

export const getCurrentUser= async(req,res)=>{
  return res
  .status(200)
  .json(
      req.user,
  )
}

export const getUser = async(req,res)=>{
  const {id}= req.params
  const user= await User.findById(id);
  res.status(200).json(user);
}

export const getUserFriends= async(req,res)=>{
  try {
    const {id}= req.params
    const user= await User.findById(id);
  
    const friends = await Promise.all(
      user.friends.map((id)=>User.findById(id))
    )
    const formattedFriends = friends.map(
      ({_id,firstName,lastName,avatar})=>{
        return {_id,firstName,lastName,avatar}
      }
    )
  
    res.status(200).json(formattedFriends)
  } catch (error) {
    res.status(400).json({message: err.message});
  }
};

export const addRemoveFriend= async(req,res)=>{
  try {
    const{id, friendId}= req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);
    
    if(user.friends.includes(friendId)){
      user.friends = user.friends.filter((id)=>id !== friendId)
      friend.friends = friend.friends.filter((id)=>id !== id)
    }
    else{
      user.friends.push(friendId);
      friend.friends.push(id);
    }

    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id)=>User.findById(id))
    )
    const formattedFriends = friends.map(
      ({_id,firstName,lastName,avatar})=>{
        return {_id,firstName,lastName,avatar}
      }
    )
    res.status(200).json(formattedFriends);
  } catch (error) {
    res.status(400).json({message: err.message});
  }
}