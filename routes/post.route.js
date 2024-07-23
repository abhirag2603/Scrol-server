import {Router} from 'express'
const router = Router()
import { verifyJWT } from '../middlewares/auth.middleware.js'

router.route("/createPost").post(verifyJWT,upload.single('media'),createPost);

export default router