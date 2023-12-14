import express from "express";
import validateBody from '../../decorators/validateBody.js'
import { signUpSchema, resendEmailSchema } from "../../schemas/authSchema.js";
import authController from "../../controllers/authController.js";
import { authenticate } from "../../middleware/authenticate.js";
import { upload } from '../../middleware/upload.js'


const authRouter = express.Router()

authRouter.post("/register", validateBody(signUpSchema), authController.signUp)

authRouter.get("/verify/:verificationToken", authController.verifyEmail)

authRouter.post("/verify", validateBody(resendEmailSchema), authController.resendVerificationEmail)

authRouter.post("/login", validateBody(signUpSchema), authController.signIn)

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/logout", authenticate, authController.logOut);

authRouter.patch("/", authenticate, authController.subscriptionUpdate);

authRouter.patch('/avatars',  authenticate, upload.single('avatar'), authController.avatarUpdate)

export default authRouter