import { Request, Response } from 'express';
import { Router } from 'express';
import { createUser } from '../services/UserService';

const userRouter = Router();

userRouter.post('/', (req: Request, res: Response) => {
    try {
        const token = createUser(req.body);
        console.log(`token: ${token}`)
        res.status(201).json({ message: 'User created successfully', token });
    }
    catch(err) {
        res.status(500).json({ message: 'Server error', err });
    }
});

export default userRouter