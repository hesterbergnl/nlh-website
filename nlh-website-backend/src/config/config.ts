require('dotenv').config()

// sets up environment variables from .env file
const PORT = process.env.PORT
const POSTGRES_URI = process.env.NODE_ENV === 'test'
    ? process.env.TEST_POSTGRES_URI
    : process.env.POSTGRES_URI

export default {
    PORT,
    POSTGRES_URI
}