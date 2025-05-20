const path = require('path');
const fs = require('fs');

const ROOT_PATH = path.dirname(__dirname);
const STORAGE_PATH = path.join(ROOT_PATH, 'storage');
const UPLOAD_PATH = path.join(STORAGE_PATH, 'uploads');
const THUMBNAIL_PATH = path.join(UPLOAD_PATH, 'thumbnails');
const VIDEO_PATH = path.join(UPLOAD_PATH, 'videos');
const IMAGE_PATH = path.join(UPLOAD_PATH, 'images');

// Danh sách các thư mục cần kiểm tra/tạo
const paths = [STORAGE_PATH, UPLOAD_PATH, THUMBNAIL_PATH, VIDEO_PATH, IMAGE_PATH];

paths.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    }
});

module.exports = {
    STORAGE_PATH,
    UPLOAD_PATH,
    THUMBNAIL_PATH,
    VIDEO_PATH,
    IMAGE_PATH
};