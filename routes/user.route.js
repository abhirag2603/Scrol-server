import {Router} from 'express'
const router = Router()
import { upload } from '../middlewares/multer.middleware.js'
import { register,login,logout,getCurrentUser,getUser } from '../controllers/user.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

router.route("/login").post(login)
router.route("/register").post(register) 
router.route("/logout").post(verifyJWT, logout) 
router.route("/getcurrentuser").post(verifyJWT, getCurrentUser) 
router.route("/:id").post(verifyJWT,getUser)













export default router