const express = require('express');
const userRoutes = require('@http_routes/videoRoutes');
const imageRoutes = require('@http_routes/imageRoutes');
const app = express();
const cors = require('cors');
const moment = require('moment');
const path = require('path');

app.use(cors()); // Allow all origins
app.use(express.json());

app.use((req, res, next) => {
    const start = moment().utc();
    res.on('finish', () => {
        const duration = moment().utc().diff(start, 'ms');
        console.log(`[${start.format('YYYY-MM-DD HH:mm:ss:SSS')}] ${req.method} ${req.originalUrl} handled in ${duration}ms`);
    });
    next();
});

// Register health check route
app.get('/health', healthCheck);
// Health check function
function healthCheck(req, res) {
    res.json({ status: true, message: 'Video service is running' });
}

app.use('/upload/video', userRoutes);
app.use('/upload/image', imageRoutes);

// Cho phép truy cập trực tiếp file ảnh/video qua /uploads
app.use('/uploads', express.static(path.join(__dirname, '../../storage/uploads')));

const PORT = process.env.HTTP_PORT || 4001;
app.listen(PORT, () => {
    console.log(`Video HTTP service running at http://localhost:${PORT}`);
});