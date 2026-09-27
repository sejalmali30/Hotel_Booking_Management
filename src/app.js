import express from "express";
import cors from "cors";
import { router } from "./routes/auth.routes.js";

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use("/api/auth", router)

app.get('/', (req, res) =>{
    res.send('Welcome to the Hotel Booking Management API')
})

export {app}