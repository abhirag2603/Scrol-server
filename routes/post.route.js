import {Router} from 'express'
const router = Router()
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js';
import { addComment, createPost, deleteComment, deletePost, getFeedPosts, getPostComments, getUserPosts,likePost} from '../controllers/post.controller.js';

router.route("/createpost").post(verifyJWT,upload.single("picture"),createPost);
router.get("/getfeedposts", verifyJWT, getFeedPosts);
router.get("/:userId/posts", verifyJWT, getUserPosts);
router.patch("/:id/like", verifyJWT, likePost);
router.delete("/delete",verifyJWT,deletePost);
router.route("/addcomment").post(verifyJWT,addComment);
router.get("/getcomments/:postId", verifyJWT,getPostComments);
router.delete("/delete/:commentId", verifyJWT,deleteComment);

export default router