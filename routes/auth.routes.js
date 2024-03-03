import { config } from "dotenv";
config();

import { Router } from "express";
import { loginController, registerController, logoutController } from "../controllers/index.js";
import { handleLoginData, handleRegisterData, verifyToken } from "../middlewares/middlewares.js";
const router = Router({ mergeParams: true });

//PATH: /auth

router
    .route('/login')
    .get((req, res) => res.render('login'))
    .post(handleLoginData, loginController);

router
    .route('/register')
    .get((req, res) => res.render('register'))
    .post(handleRegisterData, registerController);

router
    .route('/logout')
    .get(verifyToken, logoutController);

export default router;