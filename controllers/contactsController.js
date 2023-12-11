import { Contact } from '../models/Contact.js'
import { HttpError } from '../helpers/HttpError.js'

const getAll = async (req, res, next) => {
    try {
        const { _id: owner } = req.user;
        const { page = 1, limit = 20, ...filterParams } = req.query;
        const skip = (page - 1) * limit;
        const filter = { owner, ...filterParams };
        const data = await Contact.find(filter, "-createdAt -updatedAt", { skip, limit }).populate("owner", "username email");
        const total = await Contact.countDocuments(filter);

        res.json({data, total})
    } catch (error) {
        next(error)
    }
}

const getById = async (req, res, next) => {
    try {
        const { _id: owner } = req.user;
        const { contactId } = req.params
        const data = await Contact.findOne({ _id: contactId, owner })
        if (!data) {
            throw HttpError(404, 'Contact not found');
        }
        res.json(data)
    }
    catch (error) {
        next(error)
    }
}

const addContact = async (req, res, next) => {
    try {
        const { _id: owner } = req.user;
        const data = await Contact.create({ ...req.body, owner })
        res.status(201).json(data)
    }
    catch (error) {
        next(error)
    }
}

const removeContact = async (req, res, next) => {
    try {
        const { _id: owner } = req.user;
        const { contactId } = req.params
        const data = await Contact.findOneAndDelete({ _id: contactId, owner })
        if (!data) {
            throw HttpError(404, 'Contact not found');
        }
        res.json({ message: "contact deleted" })
    } catch (error) {
        next(error)
    }
}

const updateContact = async (req, res, next) => {
    try {
        const { _id: owner } = req.user;
        const { contactId } = req.params
        const data = await Contact.findOneAndUpdate({ _id: contactId, owner }, req.body)
        if (!data) {
            throw HttpError(404, 'Contact not found');
        }
        res.json(data)
    }
    catch (error) {
        next(error)
    }
}


export default {
    getAll,
    getById,
    addContact,
    removeContact,
    updateContact,
}