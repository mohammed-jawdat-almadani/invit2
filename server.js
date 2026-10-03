const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
    // إزالة معلمات الاستعلام وفك ترميز المسار
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let decodedPath = decodeURIComponent(parsedUrl.pathname);

    // توجيه المسار الرئيسي إلى index.html
    if (decodedPath === '/' || decodedPath === '') {
        decodedPath = '/index.html';
    }

    // بناء المسار المطلق والتحقق من الأمان ضد directory traversal
    const safePath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
    let filePath = path.join(PUBLIC_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // توجيه إلى index.html في حال عدم العثور على مسار محدد
            filePath = path.join(PUBLIC_DIR, 'index.html');
            fs.stat(filePath, (fallbackErr, fallbackStats) => {
                if (fallbackErr || !fallbackStats.isFile()) {
                    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end('404 Not Found');
                    return;
                }
                serveFile(req, res, filePath, fallbackStats);
            });
            return;
        }

        serveFile(req, res, filePath, stats);
    });
});

function serveFile(req, res, filePath, stats) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const totalSize = stats.size;
    const range = req.headers.range;

    // دعم Range Requests للفيديوهات والمقاطع الصوتية لضمان التشغيل السلس على جميع الأجهزة والهواتف
    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

        if (isNaN(start) || start >= totalSize || end >= totalSize || start > end) {
            res.writeHead(416, {
                'Content-Range': `bytes */${totalSize}`,
                'Content-Type': 'text/plain'
            });
            return res.end('Requested Range Not Satisfiable');
        }

        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${totalSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400'
        });

        fileStream.pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': totalSize,
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
            'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
        });

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🌊 Royal Ocean Wedding Platform is running on port ${PORT}`);
});
