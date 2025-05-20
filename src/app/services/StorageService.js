const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { VIDEO_PATH, IMAGE_PATH } = require('@config/path');
const MAX_FILE_NAME_LENGTH = 100;
/**
 * Lưu file theo quy tắc lưu trữ cho video/image
 * @param {Stream} fileStream - Stream của file upload
 * @param {string} originalName - Tên file gốc
 * @param {'video'|'image'} type - Loại file
 * @returns {Promise<string>} - Đường dẫn file đã lưu (filepath)
 */

function saveFileWithRule(fileStream, originalName, type) {
    return new Promise((resolve, reject) => {
        const dateFolder = moment().format('YYYY-MM-DD');
        const ext = path.extname(originalName);
        let baseName = path.basename(originalName, ext).toLowerCase();
        baseName = baseName.replace(/[^a-z0-9]/g, '');
        if (baseName.length > MAX_FILE_NAME_LENGTH) {
            baseName = baseName.slice(0, MAX_FILE_NAME_LENGTH);
        }

        const timestamp = moment().unix();
        let dir, filename;
        if (type === 'video') {
            dir = path.join(VIDEO_PATH, dateFolder);
            filename = `v-${baseName}-t-${timestamp}${ext}`;
        } else if (type === 'image') {
            dir = path.join(IMAGE_PATH, dateFolder);
            filename = `i-${baseName}-t-${timestamp}${ext}`;
        } else {
            return reject(new Error('Invalid type for saveFileWithRule'));
        }

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const saveTo = path.join(dir, filename);
        const writeStream = fs.createWriteStream(saveTo);
        fileStream.pipe(writeStream);

        const filepath = path.join(dateFolder, filename);
        writeStream.on('finish', () => resolve(filepath));
        writeStream.on('error', reject);
        fileStream.on('error', reject);
    });
}

function saveVideo(fileStream, originalName) {
    return saveFileWithRule(fileStream, originalName, 'video');
}

async function saveImage(filecontent, originalName) {
    // return saveFileWithRule(filecontent, originalName, 'image');  
}

module.exports = {
    saveFileWithRule,
    saveVideo,
    saveImage,
};