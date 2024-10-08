import express from 'express';
const app = express();
require('express-async-errors')
import cors from 'cors';

import blogRouter from './app/routes/blog.routes';
import userRouter from './app/routes/user.routes';
import loginRouter from './app/routes/login.routes'

import { errorHandler, requestLogger, unknownEndpoint } from './app/middlewares/error.middleware';

import init from './utils/init';
import logger from './app/middlewares/logger.middleware';

init().then().catch(error => {
    logger.error('Promise rejected:', error);
});

app.use(cors());
app.use(express.json());

app.use(requestLogger);
app.use('/api/blog', blogRouter);
app.use('/api/user', userRouter);
app.use('/api/login', loginRouter);
app.use(unknownEndpoint);
app.use(errorHandler);


export default app