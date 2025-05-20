const fs = require('fs');
const path = require('path');
const hlsConverter = require('@services/hlsConverter');
const { saveImage, saveVideo } = require('@services/StorageService');
const { UPLOAD_PATH } = require('@config/path');
/**
 * Controller xử lý upload video và thumbnail
 * @param {Stream} videoStream - Stream video upload
 * @param {string} videoName - Tên file video
 * @param {Stream} thumbnailStream - Stream thumbnail upload
 * @param {string} thumbnailName - Tên file thumbnail
 * @returns {Promise<Object>} - Kết quả upload
 */
async function uploadVideoAndThumbnail(videoStream, videoName, thumbnailStream, thumbnailName) {
    let videoPath, thumbnailPath;
    try {
        // Lưu thumbnail trước
        const [thumbnailPath, videoPath] = await Promise.all([
            saveImage(thumbnailStream, thumbnailName, 'uploads'),
            saveVideo(videoStream, videoName, 'uploads')
        ]);

        return {
            status: true,
            data: {
                video: videoPath,
                thumbnail: thumbnailPath
            }
        };
    } catch (err) {
        // Rollback: xóa file đã lưu nếu có lỗi
        if (videoPath && fs.existsSync(videoPath)) 
            fs.unlinkSync(videoPath);

        if (thumbnailPath && fs.existsSync(thumbnailPath)) 
            fs.unlinkSync(thumbnailPath);
        
        return {
            status: false,
            error: err.message
        };
    }
}


async function uploadImage(filecontent, imageName) {
    try {
        const imagePath = await saveImage(filecontent, imageName);
        return {
            status: true,
            data: imagePath
        };
    } catch (err) {
        return {
            status: false,
            error: err.message
        };
    }
}

module.exports = {
    uploadVideoAndThumbnail,
    uploadImage,
};