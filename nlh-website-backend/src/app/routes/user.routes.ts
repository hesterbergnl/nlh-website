import { Request, Response } from 'express';
import { Router } from 'express';
import { createUser } from '../services/UserService';
import { matchedData, validationResult } from 'express-validator';
import { validateUserEntry } from "../../utils/validation";

const userRouter = Router();

userRouter.post('/', validateUserEntry, async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, username, email, password, createdById } = matchedData(req)

    try {
        const result = await createUser(name, username, email, password, createdById);
        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message || 'Server Error' });
    }
});

export default userRouter