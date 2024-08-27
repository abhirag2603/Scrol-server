import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
 content:{
    type: String,
    required:true,
 },
 postId:{
    type: String,
    required:true,
 },
 userId:{
    type: String,
    required: true, 
  },
})

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;