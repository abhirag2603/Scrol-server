import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

export const createPost = async (req, res) => {
    try {
        const { username, description } = req.body;
        const user = await User.findOne({username});

    
        const pictureLocalPath = req.file?.path;
        console.log('Description:', description);
        console.log('Picture Local Path:', pictureLocalPath);

        if (!pictureLocalPath) {
            return res.status(400).json({ message: 'No picture uploaded' });
        }

    
        const postPicture = await uploadOnCloudinary(pictureLocalPath);

        if (!postPicture) {
            return res.status(500).json({ message: 'Failed to upload picture to Cloudinary' });
        }

        const newPost = new Post({
            userId:user._id,
            username:username,
            firstName: user.firstName,
            lastName: user.lastName,
            description,
            userPicturePath: user.avatar,
            picture: postPicture.url,
            likes: {},
            comments: []
        });

        await newPost.save();

        const posts = await Post.find();

        res.status(201).json(posts);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(409).json({ message: error.message });
    }
};

export const getFeedPosts = async(req,res)=>{
    try {
        const posts = await Post.find();

        res.status(200).json(posts);
        
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getUserPosts= async(req,res)=>{;
    try {
        const {userId}= req.params;
        const posts =await Post.find({userId})
        res.status(200).json(posts)
        
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const likePost =async(req,res)=>{
    try {
        const{id}=req.params;
        const {userId}=req.body;
        const post = await Post.findById(id);
        const isLiked =post.likes.get(userId);

        if(isLiked){
            post.likes.delete(userId);
        }else{
            post.likes.set(userId, true)
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            {likes: post.likes},
            {new: true}
        )
        res.status(200).json(updatedPost)
        
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const deletePost = async (req, res) => {
    try {
      const { postId } = req.body;
  
      if (!postId) {
        return res.status(400).json({ message: 'Post ID is required' });
      }
  
      const deletedPost = await Post.findByIdAndDelete(postId);
  
      if (!deletedPost) {
        console.log('Post not found');
        return res.status(404).json({ message: 'Post not found' });
      }
  
      res.status(200).json('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  };
  