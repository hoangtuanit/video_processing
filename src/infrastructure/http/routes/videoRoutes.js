const express = require('express');
const router = express.Router();
const Busboy = require('busboy');
const moment = require('moment');
const path = require('path');
const { uploadVideoAndThumbnail } = require('@controllers/StorageController');

router.post('/upload', (req, res) => {
    const busboy = Busboy({ headers: req.headers });
    let videoStream = null, videoName = null;
    let thumbnailStream = null, thumbnailName = null;

    console.log('Busboy initialized', req.body);

    busboy.on('file', (fieldname, file, payload) => {
        const { filename, encoding, mimeType } = payload;
        file.on('data', (data) => {
            console.log(`File [${filename}] got ${data.length} bytes`);
        }).on('close', () => {
            console.log(`File [${filename}] done`);
            if (fieldname === 'video') {
                videoStream = file;
                videoName = payload.filename;
            } else if (fieldname === 'thumbnail') {
                thumbnailStream = file;
                thumbnailName = payload.filename;
            }
        });
    });

    busboy.on('error', (err) => {
        console.error('Busboy error:', err);
        res.status(500).json({ status: false, error: 'Internal server error' });
    });
    
    busboy.on('finish', async () => {
        console.log('Busboy finished processing');
        if (!videoStream || !thumbnailStream) {
            return res.status(400).json({ status: false, error: 'Video and thumbnail are required' });
        }
        try {
            const result = await uploadVideoAndThumbnail(videoStream, videoName, thumbnailStream, thumbnailName);
            console.log('Upload result:', result);
            if (result.status) {
                res.json({ status: true, data: result.data });
            } else {
                res.status(500).json({ status: false, error: result.error });
            }
        } catch (err) {
            console.error('Error during upload:', err);
            res.status(500).json({ status: false, error: err.message });
        }
    });

    req.pipe(busboy);
});

module.exports = router;