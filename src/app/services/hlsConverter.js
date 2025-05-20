const { exec } = require('child_process');
const path = require('path');
const Pusher = require("pusher");
const fs = require('fs');

const SUPPORTED_VIDEO_EXTS = ['.mp4', '.avi', '.mkv', '.mov', '.flv', '.webm', '.mpeg', '.wmv', '.ts', '.m4v', '.vob', '.ogv', '.3gp'];

function isSupportedVideo(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return SUPPORTED_VIDEO_EXTS.includes(ext);
}

module.exports = function convertToHLS(videoPath) {
    return new Promise((resolve, reject) => {
        if (!isSupportedVideo(videoPath)) {
            return reject(new Error('Unsupported video format'));
        }

        const outputBaseDir = path.dirname(videoPath);
        const baseName = path.basename(videoPath, path.extname(videoPath));
        const outputDir = path.join(outputBaseDir, `${baseName}`);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const hlsPath = path.join(outputDir, baseName + '.m3u8');
        const cmd = `ffmpeg -y -i "${videoPath}" -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${hlsPath}"`;
        const pusher = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key:  process.env.PUSHER_KEY,
            secret:  process.env.PUSHER_SECRET,
            cluster:  process.env.PUSHER_CLUSTER,
            useTLS: process.env.PUSHER_USE_TLS === '1',
        });
        
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                pusher.trigger("my-channel", "my-event", {
                    status: false,
                    message: error.message,
                });

                return reject(new Error('FFmpeg error: ' + stderr));
            }

            pusher.trigger("my-channel", "my-event", {
                status: true,
                message: "Success",
                hlsPath: hlsPath,
            });

            resolve(hlsPath);
        });
    });
};