

// // src/server.js
import dotenv from "dotenv";

dotenv.config();
// console.log("DATABASE_URL:", process.env.DATABASE_URL);
import { createServer } from "http"; // Add this
import { Server } from "socket.io";  // Add this
import app from "./app.js";
import { db } from "./config/db.js";

// dotenv.config();


const PORT = process.env.PORT || 5000;
// console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    
    methods: ["GET", "POST"]
  }
});

// Basic Socket logic
io.on("connection", (socket) => {
  console.log("📡 New client connected:", socket.id);

  // Join a room based on channelId so users only get messages for their chat
  socket.on("join_channel", (channelId) => {
    socket.join(channelId);
    console.log(`👤 User joined channel: ${channelId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

// Export io so we can use it in our controllers to emit messages
export { io };

(async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ Database connected successfully");
    
    // Use httpServer.listen instead of app.listen
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server + Socket.io running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
})();