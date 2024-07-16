import mongoose from "mongoose";

const userSchema= new mongoose.Schema({

firstName:{
    type: String,
    required: true,
    min: 2,
    max:20,
},
lastName:{
    type: String,
    required: true,
    min: 2,
    max:20,
},
email:{
    type: String,
      required: true,
      max: 50,
      unique: true,
},
password: {
    type: String,
    required: true,
    min: 5,
  },
  avatar: {
    type: String,
    default: "",
  },
  friends: {
    type: Array,
    default: [],
  },
},{timestamps: true})

const User= mongoose.model("User",userSchema)
export default User