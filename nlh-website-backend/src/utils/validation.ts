import { body, header, validationResult } from 'express-validator';
import User from '../app/models/UserModel';
import {Request, Response, NextFunction} from 'express';

// @ts-ignore
// @ts-ignore
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
                throw new Error('A user already exists with this username');
            }}),
    body('password').exists().trim().isString().isLength({min: 8}).withMessage('Password validation failed!'),
    body('createdById').exists().trim().isInt().withMessage('Created by ID validation failed!'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        next();
        return;
    }
]

export const validateBlogEntry = [
    body('title').exists().trim().isString().isLength({min: 2}).withMessage('Title validation failed!'),
    body('content').exists().trim().isString().isLength({min: 2}).withMessage('Content validation failed!'),
    body('description').exists().trim().isString().isLength({min: 2}).withMessage('Description validation failed!'),
    body('published').exists().trim().isBoolean().withMessage('Published validation failed!'),
    body('publishedAt').exists().trim().isString().withMessage('Published at validation failed!'),
    body('category').exists().trim().isString().withMessage('Category validation failed!'),
    header('Authorization').exists().trim().isString().contains('Bearer ').withMessage('Authorization header validation failed!'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        next();
        return;
    }
]