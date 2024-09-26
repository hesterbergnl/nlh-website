import { body } from "express-validator";
import User from '../app/models/UserModel';

export const validateUserEntry = [
    body('name').exists().trim().isString().isLength({min: 2}).withMessage('Name validation failed!'),
    body('email').exists().trim().isEmail().withMessage('Email validation failed!').custom(async value => {
        const existingUser = await User.findOne({ where: { email: value } });
        if (existingUser) {
            // Will use the below as the error message
            throw new Error('A user already exists with this e-mail address');
        }}),
    body('username').exists().trim().isString().isLength({min: 2}).withMessage('Username validation failed!')
        .custom(async value => {
            const existingUser = await User.findOne({ where: { username: value } });
            if (existingUser) {
                // Will use the below as the error message
                throw new Error('A user already exists with this e-mail address');
            }}),
    body('password').exists().trim().isString().isLength({min: 8}).withMessage('Password validation failed!'),
    body('createdById').exists().trim().isInt().withMessage('Created by ID validation failed!'),
]