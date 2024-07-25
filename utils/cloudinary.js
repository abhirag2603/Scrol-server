import dotenv from 'dotenv'
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path'; // Import the path module

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error('No file path provided');
            return null;
        }

        const normalizedPath = path.resolve(localFilePath);

        if (!fs.existsSync(normalizedPath)) {
            console.error('File does not exist:', normalizedPath);
            return null;
        }

        const response = await cloudinary.uploader.upload(normalizedPath, {
            resource_type: 'auto'
        });

        if (!response || !response.url) {
            console.error('Failed to get the URL from Cloudinary response:', response);
            return null;
        }

        fs.unlinkSync(normalizedPath);

        return response;

    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Ensure the local file is deleted even on error
        }
        return null;
    }
};

export { uploadOnCloudinary };
