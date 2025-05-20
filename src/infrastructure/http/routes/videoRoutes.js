const express = require('express');
const router = express.Router();
const Busboy = require('busboy');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { IMAGE_PATH } = require('@config/path');
const { GenerateFileName } = require('@helpers/file');

router.post('/', (req, res) => {
    const busboy = Busboy({ headers: req.headers });
    let filePaths = { video: null, thumbnail: null };
    let finishedCount = 0;
    let hasError = false;

    const fileWritePromises = [];

    busboy.on('file', (formField, filecontent, payload) => {
        if (hasError) return;
        const originalName = payload.filename;
        let fileType = null;
        let basePath = null;
        if (formField === 'video') {
            fileType = 'video';
            basePath = path.join(IMAGE_PATH, '../videos');
        } else if (formField === 'thumbnail') {
            fileType = 'image';
            basePath = path.join(IMAGE_PATH, '../images');
        } else {
            // Skip unknown fields
            filecontent.resume();
            return;
        }
        const { filename, dateFolder } = GenerateFileName(originalName, fileType);
        const saved_path = path.join(dateFolder, filename);
        const full_path = path.join(basePath, saved_path);
        fs.mkdirSync(path.dirname(full_path), { recursive: true });
        
        const writeStream = fs.createWriteStream(full_path);
        filecontent.pipe(writeStream);

        // Push một Promise cho việc ghi file
        const writePromise = new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                finishedCount++;
                filePaths[formField] = saved_path;
                console.log(`File [${formField}] saved as ${full_path}`);
                resolve();
            });
            writeStream.on('error', reject);
        });

        fileWritePromises.push(writePromise);
    });

    busboy.on('error', (err) => {
        hasError = true;
        console.error('Busboy error:', err);
        return res.status(500).json({ status: false, error: 'Internal server error' });
    });

    busboy.on('finish', async () => {
        try {
            await Promise.all(fileWritePromises); // Đợi tất cả file ghi xong

            console.log(`All files saved: ${finishedCount} files`);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'success',
                message: 'Upload completed successfully',
                data: filePaths
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'error', message: 'Failed to save files', error: err.message }));
        }
    });

    req.pipe(busboy);
})


module.exports = router;