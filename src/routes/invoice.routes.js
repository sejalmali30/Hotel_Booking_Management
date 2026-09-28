import express from "express";

import {
    addBillItemController,
    getBillItemsController,
    deleteBillItemController
} from "../controllers/invoice.controller.js";

import {authMiddleware} from "../middlewares/auth.middleware.js";
import {roleMiddleware} from "../middlewares/role.middleware.js";

const router = express.Router();


// Add charge
router.post(
    "/:invoiceId/items",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    addBillItemController
);


// View charges
router.get(
    "/:invoiceId/items",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    getBillItemsController
);


// Delete wrongly-added charge
router.delete(
    "/items/:itemId",
    authMiddleware,
    roleMiddleware("admin", "manager", "receptionist"),
    deleteBillItemController
);


export {router};