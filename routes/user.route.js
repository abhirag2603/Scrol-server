import {Router} from 'express'
const router = Router()
import { upload } from '../middlewares/multer.middleware.js'
import { register,login } from '../controllers/user.controller.js'

router.post("/login", login)
router.post("/register", register)













export default router