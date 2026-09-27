import express from "express";
import cors from "cors";
import { router as authRoutes } from "./routes/auth.routes.js";
import {router as roomTypeRoutes} from "./routes/roomType.routes.js"
import {router as roomRoutes} from "./routes/room.routes.js"

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())

app.use("/api/auth", authRoutes)

app.use("/api/room-types", roomTypeRoutes)

app.use("/api/rooms", roomRoutes);

app.get('/', (req, res) =>{
    res.send('Welcome to the Hotel Booking Management API')
})

export {app}