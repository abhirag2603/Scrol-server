import {Router} from 'express'
const router = Router()
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js';
import { createPost } from '../controllers/post.controller.js';

router.route("/createPost").post(verifyJWT,upload.single("picture"),createPost);

export default router