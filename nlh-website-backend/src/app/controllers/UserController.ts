import {Request, Response} from 'express';
import { matchedData } from 'express-validator';
import { createUser } from '../services/UserService';
import { generateToken, hashPassword } from '../../utils/auth';

export const addUserHandler = async (req: Request, res: Response) => {
    const { name, username, email, password, createdById } = matchedData(req)

    // Hash the password
    const hashedPassword = await hashPassword(password);

    try {
        const newUser = await createUser(name, username, email, hashedPassword, createdById);
        const token = generateToken(newUser.id);
        return res.status(201).json({ message: 'User created successfully', token: token });
    } catch (error: any) {
        return res.status(400).json({ error: error.message || 'Server Error' });
    }
};