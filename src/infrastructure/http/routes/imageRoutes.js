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
    let imageStream = null;
    let originalName = null;
    let saved_path = null;

    busboy.on('file', (forminput, filecontent, payload) => {
        originalName = payload.filename;
        imageStream = filecontent;
        console.log(`File [${forminput}] got ${payload.length} bytes`);
        const { filename, dateFolder } = GenerateFileName(originalName, 'image');
        saved_path = path.join(dateFolder, filename);
        const full_path = path.join(IMAGE_PATH, saved_path);
        filecontent.pipe(fs.createWriteStream(full_path))
            .on('finish', () => {
                console.log(`File saved as ${full_path}`);
            });
    });

    busboy.on('error', (err) => {
        console.error('Busboy error:', err);
        res.status(500).json({ status: false, error: 'Internal server error' });
    });

    busboy.on('finish', async () => {
        return res.status(200).json({ status: true, path: saved_path });
    });
    
    req.pipe(busboy);
})


module.exports = router;