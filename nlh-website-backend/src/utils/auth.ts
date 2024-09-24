import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config'

const SALT_ROUNDS = 10;
const SECRET = config.SECRET;

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
};

export const comparePassword = (password: string, salt: string) => {
    return bcrypt.compare(password, salt);
};

export const generateToken = (userId: string) => {
    return jwt.sign({ id: userId }, SECRET, { expiresIn: '1h' });
};