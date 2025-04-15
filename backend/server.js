import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./route/foodRoute.js";
import categoryRouter from "./route/categoryRoute.js";
import UserRouter from "./route/UserRoute.js";
import "dotenv/config";
import cartRouter from "./route/CartRoute.js";
import orderRouter from "./route/OrderRoute.js";
import analyticsRoutes from "./route/AnalyticsRoute.js";
import { createServer } from "http";
import { Server } from "socket.io";
import router from "./route/staffRoutes.js";
import Router from "./route/admin.js";


const app = express();
const port = 4000;

// ✅ Create the HTTP server
const httpServer = createServer(app);

// ✅ Attach Socket.IO to HTTP server
export const io = new Server(httpServer, {
  cors: {
  origin: ["http://localhost:4000", "http://localhost:5173"],
  methods: ["GET", "POST"],
}

});


// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
connectDB();

// API Routes
app.use("/api/food", foodRouter);
app.use("/api/categories", categoryRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", UserRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/staff", router);
app.use("/api/admin", Router);


app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ WebSocket events
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ✅ Start server using httpServer
httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
