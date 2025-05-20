const path = require('path');
const moment = require('moment');
const MAX_FILE_NAME_LENGTH = 100;

/**
 * Sinh tên file hợp lệ cho image hoặc video
 * @param {string} originalName - Tên file gốc
 * @param {'video'|'image'} type - Loại file
 * @returns {Object} { filename, dateFolder }
 */
function GenerateFileName(originalName, type) {
    const dateFolder = moment().format('YYYY-MM-DD');
    const ext = path.extname(originalName);
    let baseName = path.basename(originalName, ext).toLowerCase();
    baseName = baseName.replace(/[^a-z0-9]/g, '');
    if (baseName.length > MAX_FILE_NAME_LENGTH) {
        baseName = baseName.slice(0, MAX_FILE_NAME_LENGTH);
    }
    const timestamp = moment().unix();

    let filename;
    if (type === 'video') {
        filename = `v-${baseName}-t-${timestamp}${ext}`;
    } else if (type === 'image') {
        filename = `i-${baseName}-t-${timestamp}${ext}`;
    } else {
        throw new Error('Invalid type for generateFileName');
    }

    return { filename, dateFolder };
}

module.exports = {
    GenerateFileName,
};