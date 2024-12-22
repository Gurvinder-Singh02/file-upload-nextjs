"use server";

import { v2 as cloudinary } from "cloudinary";


// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "uploads",
    },
});



export async function uploadAction(formData: FormData) {

    const file = formData.get("file");
    
    if (!file) {
        return { success: false };
    }

    // Convert file to buffer
    const bytes = await (file as File).arrayBuffer();
    const buffer = Buffer.from(bytes);

    // // Create file object for multer
    // const fileObject = {
    //     fieldname: 'file',
    //     originalname: (file as File).name,
    //     buffer: buffer
    // };

    try {
        // Upload directly to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "uploads" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            // Write buffer to stream
            const bufferStream = require('stream').Readable.from(buffer);
            bufferStream.pipe(uploadStream);
        });

        return {
            success: true,
            url: result.secure_url,
            username : formData?.username
        };

    } catch (error) {
        return { success: false };
    }
}




// only  need of cloudinary 
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



export async function getImgLink(formData: FormData) {

  const file = formData.get("imgFile");

  if (!file) {
    return { success: false };
  }

  // Convert file to buffer
  const bytes = await (file as File).arrayBuffer();
  const buffer = Buffer.from(bytes);


  try {

    // Upload directly to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "uploads" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Write buffer to stream
      const bufferStream = require('stream').Readable.from(buffer);
      bufferStream.pipe(uploadStream);
    });

    return {
      success: true,
      url: result.secure_url
    };

  } catch (error) {
    return { success: false };
  }
}
