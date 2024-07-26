import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import userRouter from './routes/user.route.js'
import postRouter from './routes/post.route.js'
import connectDB from './db/db.js'
import cookieParser from 'cookie-parser'


const app = express()

dotenv.config()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
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
})
.catch((error)=>{
    console.log("MONGODB connection failed:",error)
})

app.use('/users',userRouter)
app.use('/posts',postRouter)










