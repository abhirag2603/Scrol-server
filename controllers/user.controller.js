import User from '../models/user.model.js';
import Post from '../models/post.model.js'
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
const saltRound=10;
import { uploadOnCloudinary } from '../utils/cloudinary.js';

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
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      path: '/',             // Make cookie available across the entire site
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
    );
    console.log(token)
    
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      path: '/',             // Make cookie available across the entire site
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
    secure: true,
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
    res.status(400).json({message: error.message});
  }
}
export const editProfile = async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, username } = req.body;
  const avatarPath = req.file?.path;

  let updateData = { firstName, lastName, username };

  try {
    // Upload avatar if provided and add its URL to updateData
    if (avatarPath) {
      const avatarPicture = await uploadOnCloudinary(avatarPath);
      if (!avatarPicture) {
        return res.status(500).json({ message: 'Failed to upload avatar to Cloudinary' });
      }
      updateData.avatar = avatarPicture.url;
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update posts related to the user
    const updateResult = await Post.updateMany(
      { userId: userId },
      { 
        userPicturePath: updatedUser.avatar, 
        firstName: updatedUser.firstName, 
        lastName: updatedUser.lastName,
        username: updatedUser.username
      }
    );

    if (updateResult.nModified === 0) {
      console.warn('No posts were updated. Ensure the userId matches existing posts.');
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

