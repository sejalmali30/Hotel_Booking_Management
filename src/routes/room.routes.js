import express, { Router } from "express";
import { createRoomController, getAllRoomsController, getRoomByIdController, updateRoomController, updateRoomStatusController,deleteRoomController } from "../controllers/room.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = express.Router()

router.post("/", 
    authMiddleware, 
    roleMiddleware("admin", "manager"),
     createRoomController
)

router.get(
    "/",
    authMiddleware,
    getAllRoomsController
)

router.get(
    "/:id",
    authMiddleware,
    getRoomByIdController
)

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    updateRoomController
)

router.put(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    updateRoomStatusController
)

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteRoomController
)

export {router}