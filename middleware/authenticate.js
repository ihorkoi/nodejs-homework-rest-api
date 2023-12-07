import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { HttpError } from "../helpers/HttpError.js";

const { JWT_SECRET } = process.env


export const authenticate = async (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        throw HttpError(401, "Authorization header not found");
    }
    const [bearer, token] = authorization.split(" ")
    if (!bearer) {
        throw HttpError(401)
    }
    try {
        const { id } = jwt.verify(token, JWT_SECRET)
        if (!id) {
            throw HttpError(401, "Not authorized")
        }

        const user = await User.findById(id)

        if (!user || !user.token || user.token !== token) {
            throw HttpError(404, "Not authorized")
        }

        req.user = user;
        next();
    } catch (error) {
        next(error)
    }
}