import { Request, Response} from 'express';
import {matchedData} from 'express-validator';
import { findUserByEmail } from '../services/UserService';
import { comparePassword, generateToken } from '../../utils/auth';

export const loginHandler = async (req: Request, res: Response) => {
    const { email, password } = matchedData(req);
    const user = await findUserByEmail(email);
    if (user === null) {
        return res.status(404).json({error: 'User not found'});
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    const token = generateToken(user.id);

    return res.status(200).json({ message: 'Login successful', token: token });
}