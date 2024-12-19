import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import generateRandomHex from '../../../utils/generateRandomHex.js';
let s3Client;
export default (image_raw, callback) => {
    const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'zkvot';
    const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION || 'eu-central-1';
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
    if (!s3Client)
        s3Client = new S3Client({
            region: AWS_BUCKET_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            }
        });
    const fileName = `${generateRandomHex()}.webp`;
    const image_formatted = image_raw.replace(/^data:image\/\w+;base64,/, '');
    sharp(Buffer.from(image_formatted, 'base64'))
        .webp()
        .toBuffer()
        .then(imageBuffer => {
        const uploadParams = {
            Bucket: AWS_BUCKET_NAME,
            Key: fileName,
            Body: imageBuffer,
            ContentType: 'image/webp'
        };
        s3Client?.send(new PutObjectCommand(uploadParams), (err, _data) => {
            console.log(err);
            if (err)
                return callback('upload_failed');
            const imageUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_BUCKET_REGION}.amazonaws.com/${fileName}`;
            return callback(null, imageUrl);
        });
    })
        .catch((err) => {
        console.log(err);
        return callback('image_processing_error');
    });
};
//# sourceMappingURL=uploadImageRaw.js.map