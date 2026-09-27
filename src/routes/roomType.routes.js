import express from "express"
import { createRoomTypeController, getAllRoomTypesController, getRoomTypeByIdController, updateRoomTypeController, deleteRoomTypeController } from "../controllers/roomType.controller.js"
import {authMiddleware} from "../middlewares/auth.middleware.js"
import {roleMiddleware} from "../middlewares/role.middleware.js"

const router = express.Router()

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    createRoomTypeController
)

router.get(
    "/",
    authMiddleware,
    getAllRoomTypesController
)

router.get(
    "/:id",
    authMiddleware,
    getRoomTypeByIdController
)

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    updateRoomTypeController
)

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteRoomTypeController
)

export {router}