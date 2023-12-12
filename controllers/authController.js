import { User } from "../models/User.js";
import { HttpError } from '../helpers/HttpError.js'
import bcryptjs from 'bcryptjs'
import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env
const subsType = ['starter', 'pro', 'business']

const hashPassword = async (password) => {
    return await bcryptjs.hash(password, 10)
}

const signUp = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (user) {
            throw HttpError(409, 'Email in use')
        }
        const data = await User.create({ ...req.body, password: await hashPassword(password) })

        res.status(201).json({ user: { email, password } })
    }
    catch (error) {
        next(error)
    }
}
const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            throw HttpError(401, 'Email or password is wrong')
        }
        const correctPassword = bcryptjs.compare(password, user.password)
        if (!correctPassword) {
            throw HttpError(401, 'Email or password is wrong')
        }
        const payload = {
            id: user._id
        }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" })
        await User.findByIdAndUpdate(user._id, { token });
        res.json({ token, user: { email: email, subscription: user.subscription } })
    }
    catch (error) {
        next(error)
    }
}

const getCurrent = async (req, res, next) => {
    const { email, subscription } = req.user;
    res.json({ email, subscription })
}

const logOut = async (req, res, next) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: '' })
    res.status(204).json()
}

const subscriptionUpdate = async (req, res, next) => {
    try {
        console.log('test')
        const { _id } = req.user;
        const { subscription: newSubscription } = req.body;

        if (!subsType.find((subs) => subs === newSubscription)) {
            throw HttpError(400, 'Invalid subscription value')
        }

        await User.findByIdAndUpdate(_id, { subscription: newSubscription })
        res.status(200).json({ message: `Subscription updated to ${newSubscription}` })
    }
    catch (error) {
        next(error)
    }
}
export default {
    signUp,
    signIn,
    getCurrent,
    logOut,
    subscriptionUpdate,
}