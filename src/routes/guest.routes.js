import express from "express"
import {
    createGuestController,
    getAllGuestsController,
    searchGuestsController,
    getGuestByIdController,
    updateGuestController,
    deleteGuestController
} from "../controllers/guest.controller.js"

import { authMiddleware } from "../middlewares/auth.middleware.js"
import { roleMiddleware } from "../middlewares/role.middleware.js"

const router = express.Router()

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    createGuestController
)

router.get(
    "/search",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    searchGuestsController
)

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    getAllGuestsController
)

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    getGuestByIdController
)

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    updateGuestController
)

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "manager"),
    deleteGuestController
)

export {router}