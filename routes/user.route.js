import { Router } from 'express';
const router = Router();
import { upload } from '../middlewares/multer.middleware.js';
import { 
  register, login, logout, getCurrentUser, getUser, getUserFriends, 
  addRemoveFriend, editProfile, sendRequest, acceptRequest, rejectRequest ,removeFriend
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

router.route("/login").post(login);
router.route("/register").post(register); 
router.route("/logout").post(verifyJWT, logout); 
router.route("/getcurrentuser").post(verifyJWT, getCurrentUser); 

router.get("/:id", verifyJWT, getUser);
router.get("/:id/friends", verifyJWT, getUserFriends);
router.patch("/:id/:friendId", verifyJWT, addRemoveFriend);
router.patch("/:userId", verifyJWT, upload.single("avatar"), editProfile);

// Friend request routes
router.post('/sendRequest/:id', verifyJWT, sendRequest);
router.patch('/acceptRequest/:id/:userId', verifyJWT, acceptRequest);
router.patch('/rejectRequest/:id/:userId', verifyJWT, rejectRequest);
router.delete('/:id/friends/:friendId', verifyJWT, removeFriend);

export default router;
