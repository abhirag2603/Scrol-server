import {Router} from 'express'
const router = Router()
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js';
import { createPost, deletePost, getFeedPosts, getUserPosts,likePost} from '../controllers/post.controller.js';

router.route("/createpost").post(verifyJWT,upload.single("picture"),createPost);
router.get("/getfeedposts", verifyJWT, getFeedPosts);
router.get("/:userId/posts", verifyJWT, getUserPosts);
router.patch("/:id/like", verifyJWT, likePost);
router.delete("/delete",verifyJWT,deletePost);

export default router