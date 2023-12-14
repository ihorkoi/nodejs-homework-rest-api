import Joi from 'joi'

export const signUpSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()

})

export const resendEmailSchema = Joi.object({
    email: Joi.string().email().required(),
})