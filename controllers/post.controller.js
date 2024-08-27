import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import Comment from '../models/comment.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

export const createPost = async (req, res) => {
    try {
        const { username, description } = req.body;
        const user = await User.findOne({ username });

        const pictureLocalPath = req.file?.path;

        let postPicture = { url: "" }; // Default to an empty string if no picture is uploaded

        if (pictureLocalPath) {
            postPicture = await uploadOnCloudinary(pictureLocalPath);
        }

        const newPost = new Post({
            userId: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            description,
            userPicturePath: user.avatar,
            picture: postPicture.url, // Will be empty if no picture was uploaded
            likes: {},
            comments: [],
        });

        await newPost.save();

        const posts = await Post.find();

        res.status(201).json(posts);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(409).json({ message: error.message });
    }
};

 
export const getFeedPosts = async (req, res) => {
    try {
        const { page = 1, limit = 6 } = req.query;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalPosts = await Post.countDocuments();

        res.status(200).json({
            posts,
            totalPages: Math.ceil(totalPosts / limit),
            currentPage: page
        });
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
  

  export const addComment = async(req,res)=>{
    try {
        const{content,postId}= req.body;
        const userId=req.user._id;

        if(!content || !postId){
            console.log("Content or post invalid");
        }

        const newComment = new Comment({
            content,
            postId,
            userId,
        })

        const savedComment= await newComment.save();

        res.status(201).json({comment: savedComment});

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
  }
  export const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        // Fetch comments for the post
        const comments = await Comment.find({ postId }).exec();
        
        if (!comments || comments.length === 0) {
            console.log('No comments for this post');
            return res.status(404).json({ message: 'No comments found' });
        }

        // Extract userIds from comments
        const userIds = comments.map(comment => comment.userId);

        // Fetch user details for all userIds
        const users = await User.find({ _id: { $in: userIds } }).exec();

        // Create a map of userId to user details
        const userMap = users.reduce((acc, user) => {
            acc[user._id] = user;
            return acc;
        }, {});

        // Attach user details to each comment
        const commentsWithUserDetails = comments.map(comment => ({
            ...comment.toObject(), // Convert comment to a plain object
            user: userMap[comment.userId] || {} // Add user details or an empty object if not found
        }));

        res.status(200).json(commentsWithUserDetails);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
};

export const deleteComment = async(req,res)=>{
    try {
        const { commentId } = req.params;
    
        // Find and delete the comment
        const deletedComment = await Comment.findByIdAndDelete(commentId);
    
        if (!deletedComment) {
          return res.status(404).json({ message: 'Comment not found' });
        }
    
        res.status(200).json({ message: 'Comment deleted successfully' });
      } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
}