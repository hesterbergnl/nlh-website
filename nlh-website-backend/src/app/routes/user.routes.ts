import { Router } from 'express';
import { validateUserEntry } from "../../utils/validation";
import { addUserHandler } from '../controllers/UserController';

const userRouter = Router();

userRouter.post('/', validateUserEntry, addUserHandler);

export default userRouter