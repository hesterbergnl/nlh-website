import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config'
import { Request } from 'express';

const SALT_ROUNDS = 10;
const SECRET = config.SECRET;

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
};

export const comparePassword = (password: string, salt: string) => {
    return bcrypt.compare(password, salt);
};

export const generateToken = (userId: number) => {
    return jwt.sign({ id: userId }, SECRET, { expiresIn: '1h' });
};

const getTokenFromReq = (req: Request) => {
    const authorization = req.get('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '');
    }
    return null;
};

export const decodeToken = (req: Request) => {
    const token = getTokenFromReq(req);
    if (token) {
        return jwt.verify(token, SECRET);
    }
    return null;
};