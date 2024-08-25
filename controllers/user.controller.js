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
      httpOnly: true,       // Accessible only by the web server
      sameSite: 'None',     // Required for cross-site cookies
      secure: true,         // Send cookie only over HTTPS
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
      httpOnly: true,       // Accessible only by the web server
      sameSite: 'None',     // Required for cross-site cookies
      secure: true,         // Send cookie only over HTTPS
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

export const sendRequest = async(req,res)=>{
  try {
    const {id}=req.params;
    const senderId=req.user._id;

    const recipient = await User.findById(id);

    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (recipient.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    recipient.friendRequests.push(senderId);
    await recipient.save();

    res.status(200).json({ message: 'Friend request sent' });



  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


export const acceptRequest = async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Check if both parameters are provided
    if (!id || !userId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const recipientId = userId;
    const senderId = id;

    // Fetch the recipient and sender users
    const recipient = await User.findById(recipientId);
    const sender = await User.findById(senderId);

    // Check if both users exist
    if (!recipient || !sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the index of the sender in the recipient's friendRequests
    const requestIndex = recipient.friendRequests.indexOf(senderId);

    // If request not found, return error
    if (requestIndex === -1) {
      return res.status(400).json({ message: 'Friend request not found' });
    }

    // Remove the friend request using splice
    recipient.friendRequests.splice(requestIndex, 1);

    // Add the sender to the recipient's friends list
    recipient.friends.push(senderId);
    sender.friends.push(recipientId);

    // Save both users
    await recipient.save();
    await sender.save();

    res.status(200).json({ message: 'Friend request accepted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const rejectRequest = async (req, res) => {
  try {
    const { id, userId } = req.params;

    if (!id || !userId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const recipientId = userId;
    const senderId = id;


    const recipient = await User.findById(recipientId);

   
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    const requestIndex = recipient.friendRequests.indexOf(senderId);

    if (requestIndex === -1) {
      return res.status(400).json({ message: 'Friend request not found' });
    }

    recipient.friendRequests.splice(requestIndex, 1);

    await recipient.save();

    res.status(200).json({ message: 'Friend request rejected' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const removeFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: 'User or friend not found' });
    }

    // Check if the friend is in the user's friends list
    const userFriendIndex = user.friends.indexOf(friendId);
    if (userFriendIndex === -1) {
      return res.status(400).json({ message: 'Friend not found in your friend list' });
    }

    // Check if the user is in the friend's friends list
    const friendUserIndex = friend.friends.indexOf(id);
    if (friendUserIndex === -1) {
      return res.status(400).json({ message: 'User not found in friend\'s friend list' });
    }

    // Remove friend from user's friends list using splice
    user.friends.splice(userFriendIndex, 1);

    // Remove user from friend's friends list using splice
    friend.friends.splice(friendUserIndex, 1);

    // Save the updated user and friend
    await user.save();
    await friend.save();

    res.status(200).json({ message: 'Friend removed successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/user.controller.js
export const searchUser = async (req, res) => {
  try {
    const { username } = req.params; // Changed to match the frontend query parameter name
    const loggedInUserId = req.user?._id; // Get logged-in user ID from the middleware

    if (!username) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const regex = new RegExp(username, 'i');

    // Modify query to exclude logged-in user
    const users = await User.find({
      username: { $regex: regex },
      _id: { $ne: loggedInUserId } // Exclude the logged-in user
    }).select('_id username firstName lastName avatar');

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



