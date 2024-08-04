import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import userRouter from './routes/user.route.js'
import postRouter from './routes/post.route.js'
import connectDB from './db/db.js'
import cookieParser from 'cookie-parser'
import User from './models/user.model.js'
import Post from './models/post.model.js'
import {users, posts} from './data/index.js'

const app = express()

dotenv.config()

app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    credentials: true // Allow credentials (e.g., cookies)
  }));
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(bodyParser.json({  extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));


connectDB()
.then(()=>
{
      app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running at port: ${process.env.PORT}`)
    })

    //one time
    // User.insertMany(users)
    // Post.insertMany(posts)
})
.catch((error)=>{
    console.log("MONGODB connection failed:",error)
})

app.use('/users',userRouter)
app.use('/posts',postRouter)










