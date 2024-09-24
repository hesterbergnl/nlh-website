import dotenv from 'dotenv';
dotenv.config();

// sets up environment variables from .env file
const PORT = process.env.PORT || 3001;

const POSTGRES_URI = process.env.NODE_ENV === 'test'
    ? process.env.TEST_POSTGRES_URI
    : process.env.POSTGRES_URI;

const SECRET = process.env.SECRET || 'default_secret';

export default {
    PORT,
    POSTGRES_URI,
    SECRET
};