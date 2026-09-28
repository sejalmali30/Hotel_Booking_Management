import express from "express";

import {
    checkInController,
    getActiveCheckInsController
} from "../controllers/checkIn.controller.js";

import {authMiddleware} from "../middlewares/auth.middleware.js";
import {roleMiddleware} from "../middlewares/role.middleware.js";

const router = express.Router();


// Get currently checked-in guests
router.get(
    "/active",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    getActiveCheckInsController
);


export {router}