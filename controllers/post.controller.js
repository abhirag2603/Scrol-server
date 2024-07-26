import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

export const createPost = async (req, res) => {
    try {
        const { username, description } = req.body;
        const user = await User.findOne({username});

    
        const pictureLocalPath = req.file?.path;
        console.log('Description:', description);
        console.log('Picture Local Path:', pictureLocalPath);

        if (!pictureLocalPath) {
            return res.status(400).json({ message: 'No picture uploaded' });
        }

    
        const postPicture = await uploadOnCloudinary(pictureLocalPath);

        if (!postPicture) {
            return res.status(500).json({ message: 'Failed to upload picture to Cloudinary' });
        }

        const newPost = new Post({
            userId:user._id,
            username:username,
            firstName: user.firstName,
            lastName: user.lastName,
            description,
            userPicturePath: user.avatar,
            picture: postPicture.url,
            likes: {},
            comments: []
        });

        await newPost.save();

        const posts = await Post.find();

        res.status(201).json(posts);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(409).json({ message: error.message });
    }
};
