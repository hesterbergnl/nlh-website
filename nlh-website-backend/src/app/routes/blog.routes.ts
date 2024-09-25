import { Request, Response } from 'express';
import { getBlogs, addBlog } from '../services/BlogService';
import { Router } from 'express';

const blogRouter = Router();

blogRouter.get('/', (_req: Request, res: Response) => {
    res.json(getBlogs());
});

blogRouter.post('/', (req: Request, res: Response) => {
    res.json(addBlog(req.body));
});

export default blogRouter;