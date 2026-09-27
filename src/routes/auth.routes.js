import express from "express"
import {registerStaff, loginStaff, getMe} from "../controllers/auth.controller.js"
import {authMiddleware} from "../middlewares/auth.middleware.js"
import { Router } from "express"

const router = Router()

router.post("/register", registerStaff)
router.post("/login", loginStaff)
router.get("/me", authMiddleware, getMe)

export {router}