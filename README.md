const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const rfb = require("rfb2");
const { createCanvas } = require("canvas");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const VNC_HOST = "192.168.1.100"; // Replace with your VNC server IP
const VNC_PORT = 5900; // Default VNC port
const VNC_PASSWORD = "yourpassword"; // Set your VNC password

// Connect to the VNC server
const client = rfb.createConnection({
    host: VNC_HOST,
    port: VNC_PORT,
    password: VNC_PASSWORD
});

client.on("connect", () => {
    console.log("✅ Connected to VNC server");
});

client.on("error", (err) => {
    console.error("❌ VNC Error:", err);
});

// Handle screen size event
let canvas, ctx;
client.on("desktopSize", (width, height) => {
    console.log(`🖥️ VNC Desktop size: ${width}x${height}`);
    canvas = createCanvas(width, height);
    ctx = canvas.getContext("2d");
});

// Handle framebuffer updates (screen changes)
client.on("rect", (rect) => {
    if (!ctx) return;

    console.log(`📷 Received rect: (${rect.x}, ${rect.y}) ${rect.width}x${rect.height} Encoding: ${rect.encoding}`);

    if (rect.encoding === 0) { // RAW Encoding
        const imgData = ctx.createImageData(rect.width, rect.height);
        
        let j = 0;
        for (let i = 0; i < rect.data.length; i += 3) {
            imgData.data[j++] = rect.data[i];      // R
            imgData.data[j++] = rect.data[i + 1];  // G
            imgData.data[j++] = rect.data[i + 2];  // B
            imgData.data[j++] = 255;               // A (fully opaque)
        }

        ctx.putImageData(imgData, rect.x, rect.y);

        // Send image to WebSocket clients
        io.emit("framebuffer", canvas.toDataURL());
    }
});

// WebSocket connection
io.on("connection", (socket) => {
    console.log("🔗 Client connected");
});

// Serve the frontend
app.use(express.static("public"));

server.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});

function requestUpdate() {
    client.requestUpdate({
        incremental: true, // Request only changed areas
        x: 0, y: 0,
        width: client.width,
        height: client.height
    });

    setTimeout(requestUpdate, 100); // Request every 100ms
}

client.on("connect", () => {
    console.log("✅ Connected to VNC server");
    requestUpdate(); // Start continuous updates
});