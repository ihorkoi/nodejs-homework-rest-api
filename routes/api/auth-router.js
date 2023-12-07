import express from "express";
import validateBody from '../../decorators/validateBody.js'
import { signUpSchema } from "../../schemas/authSchema.js";
import authController from "../../controllers/authController.js";
import { authenticate } from "../../middleware/authenticate.js";

const authRouter = express.Router()

authRouter.post("/register", validateBody(signUpSchema), authController.signUp)

authRouter.post("/login", validateBody(signUpSchema), authController.signIn)

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/logout", authenticate, authController.logOut);

authRouter.patch("/", authenticate, authController.subscriptionUpdate);


export default authRouter