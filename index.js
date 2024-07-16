import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import userRouter from './routes/user.route.js'
import connectDB from './db/db.js'

dotenv.config()
const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.static("public"))
app.use(express.json())
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

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

app.use('/api/v1/users',userRouter)










