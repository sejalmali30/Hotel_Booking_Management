import express from "express";

import {
    getAvailableRoomsController,
    createReservationController,
    getAllReservationsController,
    getReservationByIdController,
    updateReservationController
} from "../controllers/reservation.controller.js";
import {
    checkInController
} from "../controllers/checkIn.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";
import {roleMiddleware} from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
    "/:id/checkin",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    checkInController
);
// Search available rooms
router.get(
    "/rooms/available",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    getAvailableRoomsController
);


// Create reservation
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    createReservationController
);


// Get all reservations
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    getAllReservationsController
);


// Get reservation by ID
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    getReservationByIdController
);


// Update reservation
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    updateReservationController
);


export {router};